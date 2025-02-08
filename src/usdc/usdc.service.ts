import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Contract, ethers, EventLog, JsonRpcApiProvider } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionDto } from 'src/transactions/dto/transaction.dto';

dotenv.config();

@Injectable()
export class UsdcService implements OnModuleInit {
  private readonly logger = new Logger(UsdcService.name);
  private provider: JsonRpcApiProvider;
  private usdcContract: Contract;
  private usdcAddress = process.env.USDC_CONTRACT;
  private readonly TRANSACTION_LIMIT = 500;

  constructor(private readonly transactionsService: TransactionsService) {
    try {
      this.provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);

      const usdcAbi = [
        'event Transfer(address indexed from, address indexed to, uint256 amount)',
      ];

      if (!this.usdcAddress) {
        throw new Error('USDC contract address is not defined');
      }

      this.usdcContract = new ethers.Contract(
        this.usdcAddress,
        usdcAbi,
        this.provider,
      );
    } catch (error) {
      this.logger.error('Failed to initialize USDC contract:', error);
      throw new Error('Failed to initialize USDC contract.');
    }
  }

  async onModuleInit() {
    // Start the cron job
    await this.getAndStoreTransactions();
  }

  private async getLatestBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error('Error fetching latest block number:', error);
      throw new Error('Could not fetch latest block number.');
    }
  }

  private async getLastStoredBlock(): Promise<number> {
    try {
      const lastTransaction =
        await this.transactionsService.getLastTransaction();
      return lastTransaction
        ? lastTransaction.blockNumber
        : await this.getLatestBlock();
    } catch (error) {
      this.logger.error('Error fetching last stored block:', error);
      throw new Error('Could not determine last stored block.');
    }
  }

  private async saveTransactions(
    transactions: TransactionDto[],
  ): Promise<void> {
    try {
      await this.transactionsService.saveTransactions(transactions);
      this.logger.log(
        `Successfully saved ${transactions.length} transactions.`,
      );
    } catch (dbError) {
      this.logger.error('Error saving transactions:', dbError);
      throw new Error('Failed to save transactions.');
    }
  }

  private async processTransferEvents(
    events: EventLog[],
  ): Promise<TransactionDto[]> {
    this.logger.log(`Found ${events.length} USDC transfer events.`);

    const transactions: TransactionDto[] = [];

    for (const event of events) {
      try {
        const block = await this.provider.getBlock(event.blockNumber);
        if (!block) {
          throw new Error(`Block ${event.blockNumber} not found.`);
        }
        const timestamp = block ? new Date(block.timestamp * 1000) : null;
        const amount = event.args[2] as ethers.BigNumberish;

        transactions.push({
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp,
          transactionIndex: event.transactionIndex,
          sender: ethers.getAddress('0x' + event.topics[1].slice(26)),
          receiver: ethers.getAddress('0x' + event.topics[2].slice(26)),
          amount: Number(ethers.formatUnits(amount, 6)),
        } as TransactionDto);
      } catch (eventError) {
        this.logger.error(
          `Error processing event ${event.transactionHash}:`,
          eventError,
        );
      }
    }

    return transactions;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async getAndStoreTransactions(): Promise<void> {
    try {
      const lastStoredBlock = await this.getLastStoredBlock();
      const latestBlock = await this.getLatestBlock();

      // If first cron run, start from the latest block on c-chain and move backward to fetch rest of the blocks which number is defined by TRANSACTION_LIMIT
      let fromBlock: number;
      if (lastStoredBlock === latestBlock) {
        fromBlock = latestBlock - this.TRANSACTION_LIMIT;
      } else {
        fromBlock = lastStoredBlock + 1; // Continue from last stored
      }

      this.logger.log(
        `Fetching transfers from block ${fromBlock} to ${latestBlock}`,
      );

      if (fromBlock > latestBlock) {
        this.logger.log('No USDC transfer events found.');
        return;
      }

      const toBlock = Math.min(fromBlock + this.TRANSACTION_LIMIT, latestBlock);
      const events = (await this.usdcContract.queryFilter(
        this.usdcContract.filters.Transfer(),
        fromBlock,
        toBlock,
      )) as EventLog[];

      if (!events.length) {
        this.logger.log('No USDC transfer events found in the given range.');
        return;
      }

      const transactions = await this.processTransferEvents(events);

      try {
        await this.saveTransactions(transactions);
      } catch (dbError) {
        this.logger.error('Error saving transactions:', dbError);
        throw new Error('Failed to save transactions.');
      }
    } catch (error) {
      this.logger.error('Failed to fetch and store transactions:', error);
      throw new Error('Unexpected error while fetching transactions.');
    }
  }
}
