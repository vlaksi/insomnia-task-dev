import { Module } from '@nestjs/common';
import { UsdcService } from './usdc.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  providers: [UsdcService],
  controllers: [],
  exports: [UsdcService],
})
export class UsdcModule {}
