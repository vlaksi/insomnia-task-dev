import { Test, TestingModule } from '@nestjs/testing';
import { UsdcService } from './usdc.service';

describe('UsdcService', () => {
  let service: UsdcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsdcService],
    }).compile();

    service = module.get<UsdcService>(UsdcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
