import { OnModuleInit } from '@nestjs/common';
import { TransactionsService } from 'src/transactions/transactions.service';
export declare class UsdcService implements OnModuleInit {
    private readonly transactionsService;
    private readonly logger;
    private provider;
    private usdcContract;
    private usdcAddress;
    private readonly TRANSACTION_LIMIT;
    constructor(transactionsService: TransactionsService);
    onModuleInit(): Promise<void>;
    private getLatestBlock;
    private getLastStoredBlock;
    private saveTransactions;
    private processTransferEvents;
    getAndStoreTransactions(): Promise<void>;
}
