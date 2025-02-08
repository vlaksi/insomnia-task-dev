# **USDC Transaction Aggregation System - Architecture Design Document**

## **1. Introduction**

### **1.1 Purpose**

This document provides an overview of the architecture, design decisions, and implementation details of the **USDC Transaction Aggregation System**. The system is responsible for:

- Aggregating real-time USDC transfer events.
- Storing transactions in a database.
- Exposing API endpoints for querying aggregated transaction data.
- Running periodic background jobs to fetch data.

### **1.2 Scope**

The system fetches USDC transactions from the Avalanche blockchain, stores them in a PostgreSQL database, and provides APIs to query aggregated transaction data over custom time intervals.

## **2. System Overview**

### **2.1 High-Level Architecture**

The system is built using **NestJS** with **TypeORM** for database interactions and **Ethers.js** for blockchain event processing. The architecture consists of:

1. **USDC Service** - Fetches USDC transfers from the blockchain.
2. **Transaction Service** - Stores and aggregates transaction data.
3. **Scheduled Jobs** - Periodic background jobs to fetch new transactions.
4. **REST API** - Exposes endpoints for retrieving transaction data.

### **2.2 Technologies Used**

- **NestJS** (Node.js framework for API development)
- **TypeORM** (ORM for PostgreSQL)
- **PostgreSQL** (Database for transaction storage)
- **Ethers.js** (Blockchain event processing)
- **Swagger** (API documentation)
- **Docker** (For containerization)
- **Jest** (For unit testing)

## **3. System Components**

### **3.1 USDC Service**

Responsible for fetching blockchain transactions at scheduled intervals.

#### **Responsibilities:**

- Connects to Avalanche blockchain using **Ethers.js**.
- Fetches USDC **Transfer** events.
- Processes events and extracts transaction details.
- Calls `TransactionService` to persist valid transactions.

### **3.2 Transaction Service**

Handles transaction storage and aggregation queries.

#### **Responsibilities:**

- Saves fetched transactions in **PostgreSQL**.
- Provides query methods to retrieve **total transferred USDC** over time intervals.
- Prevents duplicate transactions.

### **3.3 Scheduled Jobs**

Automates transaction fetching.

- **Fetch Transactions Job (Runs Every 5 Minutes):** Fetches new transactions starting from the last stored transaction.

### **3.4 REST API**

Exposes endpoints for users to retrieve aggregated transaction data.

#### **Endpoints:**

| Method | Endpoint                 | Description                                         |
| ------ | ------------------------ | --------------------------------------------------- |
| GET    | `/total-transferred`     | Get total USDC transferred in a given time interval |
| GET    | `/top-sender-accounts`   | Get Top 10 Sender Account                           |
| GET    | `/top-receiver-accounts` | Get Top 10 Receiver Accounts                        |
| GET    | `/paginated`             | Get paginated transactions                          |
| GET    | `/largest`               | Get largest transactions                            |
| GET    | `/:hash`                 | Get transaction details by hash                     |

## **4. Data Model**

### **4.1 Database Schema (PostgreSQL)**

```sql
CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number INT NOT NULL,
    sender VARCHAR(42) NOT NULL,
    receiver VARCHAR(42) NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## **5. Implementation Details**

### **5.1 USDC Transaction Fetching Logic**

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
private async getAndStoreTransactions(): Promise<TransactionDto[]> {
    const lastStoredBlock = await this.getLastStoredBlock();
    const latestBlock = await this.getLatestBlock();
    const fromBlock = lastStoredBlock + 1;

    const toBlock = Math.min(fromBlock + this.TRANSACTION_LIMIT, latestBlock);
    const events = await this.usdcContract.queryFilter(
      this.usdcContract.filters.Transfer(),
      fromBlock,
      toBlock
    );

    const transactions = events.map(event => ({
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      sender: ethers.getAddress('0x' + event.topics[1].slice(26)),
      receiver: ethers.getAddress('0x' + event.topics[2].slice(26)),
      amount: Number(ethers.formatUnits(event.args[2], 6)),
      timestamp: new Date((await this.provider.getBlock(event.blockNumber)).timestamp * 1000)
    }));

    await this.transactionsService.saveTransactions(transactions);
}
```

### **5.2 Aggregation Queries**

```typescript
async saveTransactions(transactions: TransactionDto[]) {
    try {
      if (!transactions.length) {
        this.logger.warn('No transactions to save.');
        return;
      }

      const transactionHashes = transactions.map((tx) => tx.transactionHash);

      const existingTransactions = await this.transactionsRepository.find({
        where: { transactionHash: In(transactionHashes) },
        select: ['transactionHash'],
      });

      const existingTransactionHashes = new Set(
        existingTransactions.map((tx) => tx.transactionHash),
      );

      const newTransactions = transactions.filter(
        (tx) => !existingTransactionHashes.has(tx.transactionHash),
      );

      if (newTransactions.length > 0) {
        try {
          // Try bulk inserting, handle conflicts
          await this.transactionsRepository
            .createQueryBuilder()
            .insert()
            .into('transaction')
            .values(newTransactions)
            .orIgnore() // Prevents duplicate key errors
            .execute();

          this.logger.log(`Saved ${newTransactions.length} new transactions.`);
        } catch (error) {
          this.logger.error('Error inserting transactions', error);
          throw new InternalServerErrorException(
            'An error occurred while saving transactions.',
          );
        }
      } else {
        this.logger.warn('No new transactions to save (all were duplicates).');
      }
    } catch (error: unknown) {
      this.logger.error('Error saving transactions', error);
      throw new InternalServerErrorException(
        'An error occurred while saving transactions.',
      );
    }
  }

  async getLastTransaction(): Promise<Transaction | null> {
    try {
      const lastTransaction = await this.transactionsRepository.findOne({
        where: {},
        order: { blockNumber: 'DESC' },
      });

      if (lastTransaction) {
        this.logger.debug(
          `Last transaction found: ${lastTransaction.transactionHash}`,
        );
      } else {
        this.logger.warn('No transactions found in the database.');
      }

      return lastTransaction;
    } catch (error: unknown) {
      this.logger.error('Error fetching last transaction', error);
      throw new InternalServerErrorException(
        'An error occurred while retrieving the last transaction.',
      );
    }
  }

  async getTotalTransferred(intervalInMinutes: number): Promise<number> {
    try {
      if (
        !intervalInMinutes ||
        isNaN(intervalInMinutes) ||
        intervalInMinutes < 5
      ) {
        throw new BadRequestException(
          'Invalid interval. Must be a positive number greater or equal to 5.',
        );
      }

      // Ensure cutoff time is in UTC and formatted properly for SQL
      const cutoffTime = new Date(
        Date.now() - intervalInMinutes * 60 * 1000,
      ).toISOString();

      const result: { total: string | null } | undefined =
        await this.transactionsRepository
          .createQueryBuilder('transaction')
          .select('SUM(transaction.amount)', 'total')
          .where('transaction.timestamp >= :cutoffTime', { cutoffTime })
          .getRawOne();

      return Number(result?.total) || 0;
    } catch (error: unknown) {
      this.logger.error('Failed to calculate total USDC transferred', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while fetching total USDC transferred.',
      );
    }
  }

  async getTopSenderAccounts(): Promise<
    { senderAddress: string; total: number }[]
  > {
    try {
      const result = await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('transaction.sender', 'address')
        .addSelect('SUM(transaction.amount)', 'total')
        .groupBy('transaction.sender')
        .orderBy('total', 'DESC')
        .limit(10)
        .getRawMany<{ senderAddress: string; total: number }>();

      if (!result || result.length === 0) {
        this.logger.warn('No sender accounts found.');
        return [];
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch top sender accounts', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching top sender accounts.',
      );
    }
  }

  async getTopReceiverAccounts(): Promise<
    { receiverAddress: string; total: number }[]
  > {
    try {
      const result = await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('transaction.receiver', 'address')
        .addSelect('SUM(transaction.amount)', 'total')
        .groupBy('transaction.receiver')
        .orderBy('total', 'DESC')
        .limit(10)
        .getRawMany<{ receiverAddress: string; total: number }>();

      if (!result || result.length === 0) {
        this.logger.warn('No receiver accounts found.');
        return [];
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch top receiver accounts', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching top receiver accounts.',
      );
    }
  }
```

## **6. Deployment**

## **7. Conclusion**

This document outlines the architecture of the **USDC Transaction Aggregation System**. The system is designed to handle real-time blockchain data, aggregate transactions efficiently, and provide valuable insights through REST APIs.
