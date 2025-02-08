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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ScheduleModule.forRoot(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database-2.cncsam04y7xq.eu-west-1.rds.amazonaws.com',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Trenutnasale123#',
      database: process.env.DB_NAME || 'postgres',
      extra: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
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
