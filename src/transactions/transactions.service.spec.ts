import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { BadRequestException } from '@nestjs/common';
import {
  mockLargestTransactionsList,
  mockTopReceivers,
  mockTopSenders,
  mockTransaction,
  mockTransactionsList,
} from '../../test/transactions.mock';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const repositoryMock = {
    createQueryBuilder: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '1123456.78' }),
      getRawMany: jest.fn().mockResolvedValue([]),
    })),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTransactions', () => {
    it('should save transactions successfully', async () => {
      jest.spyOn(repositoryMock, 'find').mockResolvedValue([]);
      jest
        .spyOn(repositoryMock.createQueryBuilder(), 'execute')
        .mockResolvedValue({ affected: 1 });

      await expect(
        service.saveTransactions(mockTransactionsList),
      ).resolves.not.toThrow();
    });

    it('should return null if transaction does not exist', async () => {
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(null);

      const result = await service.getTransactionByHash(
        mockTransaction.transactionHash,
      );
      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException if database query for existing transactions fails', async () => {
      jest
        .spyOn(repositoryMock, 'find')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.saveTransactions(mockTransactionsList),
      ).rejects.toThrow('An error occurred while saving transactions.');
    });

    it('should throw InternalServerErrorException if bulk insert operation fails', async () => {
      jest.spyOn(repositoryMock, 'find').mockResolvedValue([]);
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest
            .fn()
            .mockRejectedValue(new Error('Database insert error')),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({}),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      await expect(
        service.saveTransactions(mockTransactionsList),
      ).rejects.toThrow('An error occurred while saving transactions.');
    });
  });

  describe('getTotalTransferred', () => {
    it('should return the total transferred amount', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '5000' }),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      const result = await service.getTotalTransferred(10);
      expect(result).toBe(5000);
    });

    it('should return 0 if no transactions exist', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: null }),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      const result = await service.getTotalTransferred(10);
      expect(result).toBe(0);
    });

    it('should throw BadRequestException for interval less than 5 minutes', async () => {
      await expect(service.getTotalTransferred(3)).rejects.toThrow(
        'Invalid interval. Must be a positive number greater or equal to 5.',
      );
    });

    it('should throw BadRequestException for NaN interval', async () => {
      await expect(service.getTotalTransferred(NaN)).rejects.toThrow(
        'Invalid interval. Must be a positive number greater or equal to 5.',
      );
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockRejectedValue(new Error('Database error')),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      await expect(service.getTotalTransferred(10)).rejects.toThrow(
        'An error occurred while fetching total USDC transferred.',
      );
    });
  });

  describe('getPaginatedTransactions', () => {
    it('should return paginated transactions', async () => {
      jest
        .spyOn(repositoryMock, 'findAndCount')
        .mockResolvedValue([mockTransactionsList, 3]);

      const result = await service.getPaginatedTransactions(1, 3);
      expect(result).toEqual({
        page: 1,
        limit: 3,
        total: 3,
        totalPages: 1,
        transactions: mockTransactionsList,
      });
    });

    it('should throw BadRequestException for invalid pagination parameters', async () => {
      await expect(service.getPaginatedTransactions(-1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database errors and throw InternalServerErrorException', async () => {
      jest
        .spyOn(repositoryMock, 'findAndCount')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getPaginatedTransactions(1, 10)).rejects.toThrow(
        'An error occurred while fetching paginated transactions.',
      );
    });
  });

  describe('getTopSenderAccounts', () => {
    it('should return top sender accounts', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest.fn().mockResolvedValueOnce(mockTopSenders),
        })) as jest.MockedFunction<any>;

      const result = await service.getTopSenderAccounts();
      expect(result).toEqual(mockTopSenders);
    });

    it('should return empty array if no top sender accounts are found', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      const result = await service.getTopSenderAccounts();
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException if fetching top sender accounts fails', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest
            .fn()
            .mockRejectedValueOnce(new Error('Database Error')),
        })) as jest.MockedFunction<any>;

      await expect(service.getTopSenderAccounts()).rejects.toThrow(
        'An error occurred while fetching top sender accounts.',
      );
    });
  });

  describe('getTopReceiverAccounts', () => {
    it('should return top receiver accounts', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest.fn().mockResolvedValueOnce(mockTopReceivers),
        })) as jest.MockedFunction<any>;

      const result = await service.getTopReceiverAccounts();
      expect(result).toEqual(mockTopReceivers);
    });

    it('should return empty array if no top receiver accounts are found', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest.fn().mockResolvedValueOnce([]),
        })) as jest.MockedFunction<any>;

      const result = await service.getTopReceiverAccounts();
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException if fetching top receiver accounts fails', async () => {
      jest
        .spyOn(repositoryMock, 'createQueryBuilder')
        .mockImplementation(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValueOnce({ total: null }),
          getRawMany: jest
            .fn()
            .mockRejectedValueOnce(new Error('Database Error')),
        })) as jest.MockedFunction<any>;

      await expect(service.getTopReceiverAccounts()).rejects.toThrow(
        'An error occurred while fetching top receiver accounts.',
      );
    });
  });

  describe('getTransactionByHash', () => {
    it('should return a transaction if found', async () => {
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(mockTransaction);

      const result = await service.getTransactionByHash('0x123');
      expect(result).toEqual(mockTransaction);
    });

    it('should return null if transaction is not found', async () => {
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(null);

      const result = await service.getTransactionByHash('0x123');
      expect(result).toBeNull();
    });

    it('should throw an error if database query fails', async () => {
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getTransactionByHash('0x123')).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('getLargestTransactions', () => {
    it('should return largest transactions', async () => {
      jest
        .spyOn(repositoryMock, 'find')
        .mockResolvedValue(mockLargestTransactionsList);

      const result = await service.getLargestTransactions(5);
      expect(result).toEqual(mockLargestTransactionsList);
    });

    it('should throw an error if fetching largest transactions fails', async () => {
      jest
        .spyOn(repositoryMock, 'find')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.getLargestTransactions(5)).rejects.toThrow(Error);
    });
  });
});
