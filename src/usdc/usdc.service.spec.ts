import { Test, TestingModule } from '@nestjs/testing';
import { UsdcService } from './usdc.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ethers, EventLog, Block } from 'ethers';
import { TransactionDto } from 'src/transactions/dto/transaction.dto';

describe('UsdcService', () => {
  let service: UsdcService;

  const mockTransactionsService = {
    getLastTransaction: jest.fn(),
    saveTransactions: jest.fn(),
    getTotalTransferred: jest.fn(),
    getTopSenderAccounts: jest.fn(),
    getTopReceiverAccounts: jest.fn(),
    getPaginatedTransactions: jest.fn(),
    getLargestTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsdcService,
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();

    service = module.get<UsdcService>(UsdcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestBlock', () => {
    it('should return latest block number', async () => {
      jest.spyOn(service['provider'], 'getBlockNumber').mockResolvedValue(1000);
      const result = await service['getLatestBlock']();
      expect(result).toBe(1000);
    });

    it('should throw an error if block number fetch fails', async () => {
      jest
        .spyOn(service['provider'], 'getBlockNumber')
        .mockRejectedValue(new Error('RPC Error'));
      await expect(service['getLatestBlock']()).rejects.toThrow(
        'Could not fetch latest block number.',
      );
    });
  });

  describe('getLastTransaction', () => {
    it('should return last stored block', async () => {
      mockTransactionsService.getLastTransaction.mockResolvedValue({
        blockNumber: 500,
      });
      const result = await service['getLastStoredBlock']();
      expect(result).toBe(500);
    });

    it('should return latest block if no stored transactions', async () => {
      mockTransactionsService.getLastTransaction.mockResolvedValue(null);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);
      const result = await service['getLastStoredBlock']();
      expect(result).toBe(1000);
    });

    it('should throw an error if fetching the last stored block fails', async () => {
      mockTransactionsService.getLastTransaction.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getLastStoredBlock()).rejects.toThrow(
        'Could not determine last stored block.',
      );
    });
  });

  describe('saveTransactions', () => {
    it('should save transactions successfully', async () => {
      const mockTransactions: TransactionDto[] = [
        {
          transactionHash: '0xabc',
          amount: 100,
          sender: '0xSender',
          receiver: '0xReceiver',
          blockNumber: 123,
          timestamp: new Date(),
        },
        {
          transactionHash: '0xdef',
          amount: 200,
          sender: '0xSender2',
          receiver: '0xReceiver2',
          blockNumber: 456,
          timestamp: new Date(),
        },
      ];

      jest
        .spyOn(mockTransactionsService, 'saveTransactions')
        .mockResolvedValue(mockTransactions);

      await expect(
        service.saveTransactions(mockTransactions),
      ).resolves.not.toThrow();

      expect(mockTransactionsService.saveTransactions).toHaveBeenCalledWith(
        mockTransactions,
      );
    });
  });

  describe('processTransferEvents', () => {
    it('should process transfer events and return transactions', async () => {
      const mockEvents: EventLog[] = [
        {
          transactionHash: '0xabc',
          blockNumber: 123,
          transactionIndex: 1,
          args: [null, null, ethers.parseUnits('10', 6)],
          topics: ['0x0', '0x'.padEnd(66, '1'), '0x'.padEnd(66, '2')],
        } as unknown as EventLog,
      ];

      jest.spyOn(service['provider'], 'getBlock').mockResolvedValue({
        number: 123,
        hash: '0xabc',
        parentHash: '0xdef',
        nonce: '0x0',
        stateRoot: '0x0',
        receiptsRoot: '0x0',
        miner: '0x0',
        difficulty: BigInt(0),
        extraData: '0x0',
        gasLimit: BigInt(0),
        gasUsed: BigInt(0),
        timestamp: 1700000000,
        transactions: [],
        baseFeePerGas: BigInt(0),
      } as unknown as Block);
      const transactions = await service['processTransferEvents'](mockEvents);

      expect(transactions).toEqual([
        {
          transactionHash: '0xabc',
          blockNumber: 123,
          timestamp: new Date(1700000000 * 1000),
          transactionIndex: 1,
          sender: '0x1111111111111111111111111111111111111111',
          receiver: '0x2222222222222222222222222222222222222222',
          amount: 10,
        },
      ]);
    });

    it('should throw an error if block is missing in processTransferEvents', async () => {
      const mockEvents: EventLog[] = [
        {
          transactionHash: '0xabc',
          blockNumber: 123,
          transactionIndex: 1,
          args: [null, null, ethers.parseUnits('10', 6)],
          topics: ['0x0', '0x'.padEnd(66, '1'), '0x'.padEnd(66, '2')],
        } as unknown as EventLog,
      ];

      jest.spyOn(service['provider'], 'getBlock').mockResolvedValue(null);

      await expect(
        service['processTransferEvents'](mockEvents),
      ).rejects.toThrow('Block 123 not found.');
    });
  });

  describe('getAndStoreTransactions', () => {
    it('should fetch, process, and store transactions', async () => {
      jest.spyOn(service, 'getLastStoredBlock').mockResolvedValue(900);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);

      const mockEvents: EventLog[] = [
        {
          transactionHash: '0xabc',
          blockNumber: 910,
          transactionIndex: 1,
          args: [null, null, ethers.parseUnits('10', 6)],
          topics: ['0x0', '0xSender', '0xReceiver'],
        } as unknown as EventLog,
      ];

      jest
        .spyOn(service['usdcContract'], 'queryFilter')
        .mockResolvedValue(mockEvents);
      jest.spyOn(service, 'processTransferEvents').mockResolvedValue([
        {
          transactionHash: '0xabc',
          blockNumber: 910,
          timestamp: new Date(),
          sender: '0xSender',
          receiver: '0xReceiver',
          amount: 10,
        },
      ]);
      await expect(service.getAndStoreTransactions()).resolves.not.toThrow();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getLastStoredBlock).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getLatestBlock).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['usdcContract'].queryFilter).toHaveBeenCalledWith(
        service['usdcContract'].filters.Transfer(),
        901,
        1000,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.processTransferEvents).toHaveBeenCalledWith(mockEvents);
      expect(mockTransactionsService.saveTransactions).toHaveBeenCalled();
    });

    it('should log and exit if no USDC transfer events are found', async () => {
      jest.spyOn(service, 'getLastStoredBlock').mockResolvedValue(900);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);
      jest.spyOn(service['usdcContract'], 'queryFilter').mockResolvedValue([]);

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await expect(service.getAndStoreTransactions()).resolves.not.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith(
        'No USDC transfer events found in the given range.',
      );
      expect(mockTransactionsService.saveTransactions).not.toHaveBeenCalled();
    });

    it('should throw an error if getLastStoredBlock fails', async () => {
      jest
        .spyOn(service, 'getLastStoredBlock')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getAndStoreTransactions()).rejects.toThrow(
        'Unexpected error while fetching transactions.',
      );
    });

    it('should throw an error if queryFilter fails', async () => {
      jest.spyOn(service, 'getLastStoredBlock').mockResolvedValue(900);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);
      jest
        .spyOn(service['usdcContract'], 'queryFilter')
        .mockRejectedValue(new Error('Smart contract error'));

      await expect(service.getAndStoreTransactions()).rejects.toThrow(
        'Unexpected error while fetching transactions.',
      );
    });

    it('should throw an error if saving transactions fails', async () => {
      jest.spyOn(service, 'getLastStoredBlock').mockResolvedValue(900);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);

      const mockEvents: EventLog[] = [
        {
          transactionHash: '0xabc',
          blockNumber: 910,
          transactionIndex: 1,
          args: [null, null, ethers.parseUnits('10', 6)],
          topics: ['0x0', '0xSender', '0xReceiver'],
        } as unknown as EventLog,
      ];

      jest
        .spyOn(service['usdcContract'], 'queryFilter')
        .mockResolvedValue(mockEvents);
      jest.spyOn(service, 'processTransferEvents').mockResolvedValue([
        {
          transactionHash: '0xabc',
          blockNumber: 910,
          timestamp: new Date(),
          sender: '0xSender',
          receiver: '0xReceiver',
          amount: 10,
        },
      ]);

      mockTransactionsService.saveTransactions.mockRejectedValue(
        new Error('Database insert error'),
      );

      await expect(service.getAndStoreTransactions()).rejects.toThrow(Error);
    });
  });

  describe('getLastStoredBlock', () => {
    it('should return last stored block', async () => {
      mockTransactionsService.getLastTransaction.mockResolvedValue({
        blockNumber: 500,
      });
      const result = await service['getLastStoredBlock']();
      expect(result).toBe(500);
    });

    it('should return latest block if no stored transactions', async () => {
      mockTransactionsService.getLastTransaction.mockResolvedValue(null);
      jest.spyOn(service, 'getLatestBlock').mockResolvedValue(1000);
      const result = await service['getLastStoredBlock']();
      expect(result).toBe(1000);
    });
  });
});
