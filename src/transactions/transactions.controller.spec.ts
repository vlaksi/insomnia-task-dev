import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  mockLargestTransactionsList,
  mockPaginatedTransactions,
  mockTopReceivers,
  mockTopSenders,
  mockTransaction,
  totalTransferredUSDC,
} from '../../test/transactions.mock';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            getTotalTransferred: jest.fn(),
            getTopAccounts: jest.fn(),
            getPaginatedTransactions: jest.fn(),
            getLargestTransactions: jest.fn(),
            getTopSenderAccounts: jest.fn(),
            getTopReceiverAccounts: jest.fn(),
            getTransactionByHash: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTotalTransferred', () => {
    it('should return total transferred USDC', async () => {
      jest
        .spyOn(transactionsService, 'getTotalTransferred')
        .mockResolvedValue(totalTransferredUSDC);
      const result = await controller.getTotalTransferred('10');
      expect(result).toEqual({ totalUSDC: totalTransferredUSDC });
    });

    it('should throw BadRequestException for invalid interval', async () => {
      await expect(controller.getTotalTransferred('abc')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on service failure', async () => {
      jest
        .spyOn(transactionsService, 'getTotalTransferred')
        .mockRejectedValue(new Error('Database error'));
      await expect(controller.getTotalTransferred('10')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getPaginatedTransactions', () => {
    it('should return paginated transactions', async () => {
      jest
        .spyOn(transactionsService, 'getPaginatedTransactions')
        .mockResolvedValue(mockPaginatedTransactions);
      const result = await controller.getPaginatedTransactions(
        mockPaginatedTransactions.page,
        mockPaginatedTransactions.limit,
      );
      expect(result).toEqual(mockPaginatedTransactions);
    });

    it('should return paginated transactions', async () => {
      jest
        .spyOn(transactionsService, 'getPaginatedTransactions')
        .mockResolvedValue(mockPaginatedTransactions);
      const result = await controller.getPaginatedTransactions(
        mockPaginatedTransactions.page,
        mockPaginatedTransactions.limit,
      );
      expect(result).toEqual(mockPaginatedTransactions);
    });

    it('should throw BadRequestException for invalid pagination params', async () => {
      await expect(controller.getPaginatedTransactions(-1, 10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getPaginatedTransactions(1, -10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        controller.getPaginatedTransactions(NaN, 10),
      ).rejects.toThrow(BadRequestException);
      await expect(controller.getPaginatedTransactions(1, NaN)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      jest
        .spyOn(transactionsService, 'getPaginatedTransactions')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getPaginatedTransactions(1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should enforce max limit of 100 transactions per page', async () => {
      const spy = jest.spyOn(transactionsService, 'getPaginatedTransactions');

      await controller.getPaginatedTransactions(1, 150);

      expect(spy).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('getLargestTransactions', () => {
    it('should return largest transactions', async () => {
      jest
        .spyOn(transactionsService, 'getLargestTransactions')
        .mockResolvedValue(mockLargestTransactionsList);
      const result = await controller.getLargestTransactions(
        mockLargestTransactionsList.length.toString(),
      );
      expect(result).toEqual(mockLargestTransactionsList);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(controller.getLargestTransactions('abc')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should enforce max limit of 100 transactions', async () => {
      const spy = jest.spyOn(transactionsService, 'getLargestTransactions');

      await controller.getLargestTransactions('150');

      expect(spy).toHaveBeenCalledWith(100);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      jest
        .spyOn(transactionsService, 'getLargestTransactions')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getLargestTransactions('10')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getTopSenderAccounts', () => {
    it('should return top sender accounts from controller', async () => {
      jest
        .spyOn(transactionsService, 'getTopSenderAccounts')
        .mockResolvedValue(mockTopSenders);
      const result = await controller.getTopSenderAccounts();
      expect(result).toEqual(mockTopSenders);
    });

    it('should return message if no top sender accounts are found', async () => {
      jest
        .spyOn(transactionsService, 'getTopSenderAccounts')
        .mockResolvedValue([]);
      const result = await controller.getTopSenderAccounts();
      expect(result).toEqual({ message: 'No sender accounts found.' });
    });

    it('should throw InternalServerErrorException if fetching top sender accounts fails', async () => {
      jest
        .spyOn(transactionsService, 'getTopSenderAccounts')
        .mockRejectedValue(new Error('Database error'));
      await expect(controller.getTopSenderAccounts()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getTopReceiverAccounts', () => {
    it('should return top receiver accounts from controller', async () => {
      jest
        .spyOn(transactionsService, 'getTopReceiverAccounts')
        .mockResolvedValue(mockTopReceivers);
      const result = await controller.getTopReceiverAccounts();
      expect(result).toEqual(mockTopReceivers);
    });

    it('should return message if no top receiver accounts are found', async () => {
      jest
        .spyOn(transactionsService, 'getTopReceiverAccounts')
        .mockResolvedValue([]);
      const result = await controller.getTopReceiverAccounts();
      expect(result).toEqual({ message: 'No receiver accounts found.' });
    });

    it('should throw InternalServerErrorException if fetching top receiver accounts fails', async () => {
      jest
        .spyOn(transactionsService, 'getTopReceiverAccounts')
        .mockRejectedValue(new Error('Database error'));
      await expect(controller.getTopReceiverAccounts()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getTransactionByHash', () => {
    it('should return transaction details', async () => {
      jest
        .spyOn(transactionsService, 'getTransactionByHash')
        .mockResolvedValue(mockTransaction);
      const result = await controller.getTransactionByHash(
        mockTransaction.transactionHash,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      jest
        .spyOn(transactionsService, 'getTransactionByHash')
        .mockResolvedValue(null);
      await expect(
        controller.getTransactionByHash(mockTransaction.transactionHash),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid hash format', async () => {
      await expect(
        controller.getTransactionByHash('invalid-hash'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      jest
        .spyOn(transactionsService, 'getTransactionByHash')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getTransactionByHash(mockTransaction.transactionHash),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
