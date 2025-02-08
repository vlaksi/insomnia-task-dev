# **USDC Transaction Aggregation System - Architecture Design Document**

## **1. Introduction**

### **1.1 Purpose**
This document provides an overview of the architecture, design decisions, and implementation details of the **USDC Transaction Aggregation System**. The system is responsible for:
- Aggregating real-time USDC transfer events.
- Storing transactions in a database.
- Exposing API endpoints for querying aggregated transaction data.
- Running periodic background jobs to fetch and clean up data.

### **1.2 Scope**
The system fetches USDC transactions from the Avalanche blockchain, stores them in a PostgreSQL database, and provides APIs to query aggregated transaction data over custom time intervals.

## **2. System Overview**

### **2.1 High-Level Architecture**
The system is built using **NestJS** with **TypeORM** for database interactions and **Ethers.js** for blockchain event processing. The architecture consists of:
1. **USDC Service** - Fetches USDC transfers from the blockchain.
2. **Transaction Service** - Stores and aggregates transaction data.
3. **Scheduled Jobs** - Periodic background jobs to fetch new transactions and remove outdated data.
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
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/transactions/total-transferred?interval=10` | Returns total USDC transferred in the last `X` minutes |
| GET | `/transactions/top-accounts` | Returns top accounts by transaction volume |

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

### **5.2 Aggregation Query**
```typescript
async getTotalTransferred(intervalInMinutes: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - intervalInMinutes * 60 * 1000);
    return await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.timestamp >= :cutoffTime', { cutoffTime })
        .getRawOne()
        .then(res => res?.total || 0);
}
```

## **6. Deployment**
- **Docker Compose** for running services in containers.

## **7. Conclusion**
This document outlines the architecture of the **USDC Transaction Aggregation System**. The system is designed to handle real-time blockchain data, aggregate transactions efficiently, and provide valuable insights through REST APIs.

