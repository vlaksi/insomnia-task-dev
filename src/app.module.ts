import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { UsdcModule } from './usdc/usdc.module';
import { Transaction } from './transactions/entities/transactions.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number.parseInt(process.env.POSTGRES_PORT as string) || 5432,
      username: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD || 'admin',
      database: process.env.POSTGRES_DB || 'usdc_transactions',
      // INFO: Uncomment the following lines for deployment
      // extra: {
      //   ssl: {
      //     require: true,
      //     rejectUnauthorized: false,
      //   },
      // },
      entities: [Transaction],
      synchronize: true,
    }),
    TransactionsModule,
    UsdcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
