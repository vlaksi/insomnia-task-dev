import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Transaction } from './entities/transactions.entity';
import { TransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

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

      // Calculate the cutoff time
      const cutoffTime = new Date(Date.now() - intervalInMinutes * 60 * 1000);

      const result: { total: number } | undefined =
        await this.transactionsRepository
          .createQueryBuilder('transaction')
          .select('SUM(transaction.amount)', 'total')
          .where('transaction.timestamp >= :cutoffTime', { cutoffTime })
          .getRawOne();

      return result?.total || 0;
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
    return await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.sender', 'address')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('transaction.sender')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getTopReceiverAccounts(): Promise<
    { receiverAddress: string; total: number }[]
  > {
    return await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.receiver', 'address')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('transaction.receiver')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getPaginatedTransactions(page: number, limit: number) {
    try {
      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1
      ) {
        this.logger.warn(
          `Invalid pagination parameters: page=${page}, limit=${limit}`,
        );
        throw new BadRequestException(
          'Page and limit must be positive integers.',
        );
      }

      this.logger.log(
        `Fetching paginated transactions: page=${page}, limit=${limit}`,
      );

      const [transactions, total] =
        await this.transactionsRepository.findAndCount({
          take: limit,
          skip: (page - 1) * limit,
          order: { timestamp: 'DESC' },
        });

      const totalPages = Math.ceil(total / limit);
      this.logger.debug(
        `Fetched ${transactions.length} transactions, total: ${total}, totalPages: ${totalPages}`,
      );

      return { page, limit, total, totalPages, transactions };
    } catch (error: unknown) {
      this.logger.error('Error fetching paginated transactions', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while fetching paginated transactions.',
      );
    }
  }

  async getTransactionByHash(hash: string): Promise<Transaction | null> {
    try {
      return await this.transactionsRepository.findOne({
        where: { transactionHash: hash },
      });
    } catch (error) {
      this.logger.error('Error fetching transaction by hash', error);
      throw new Error('Database query failed');
    }
  }

  async getLargestTransactions(limit: number): Promise<Transaction[]> {
    try {
      return await this.transactionsRepository.find({
        order: { amount: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error fetching largest transactions', error);
      throw new Error('Database query failed');
    }
  }
}
