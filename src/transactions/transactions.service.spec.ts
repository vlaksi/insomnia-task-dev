import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsRepository: Repository<Transaction>;

  const mockResult = [
    { address: '0x123', total: 1000 },
    { address: '0x456', total: 900 },
  ];

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(mockResult),
  };

  const mockTransactionsRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionsRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopSenderAccounts', () => {
    it('should return the top 10 sender accounts', async () => {
      const result = await service.getTopSenderAccounts();
      expect(result).toEqual(mockResult);
      expect(mockTransactionsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('getTopReceiverAccounts', () => {
    it('should return the top 10 receiver accounts', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { address: '0x789', total: 1200 },
        { address: '0xABC', total: 1100 },
      ]);

      const result = await service.getTopReceiverAccounts();
      expect(result).toEqual([
        { address: '0x789', total: 1200 },
        { address: '0xABC', total: 1100 },
      ]);
      expect(mockTransactionsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
