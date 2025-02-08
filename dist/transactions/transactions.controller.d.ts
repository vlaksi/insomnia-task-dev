import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    private readonly logger;
    constructor(transactionsService: TransactionsService);
    getTotalTransferred(interval: string): Promise<{
        totalUSDC: number;
    }>;
    getTopAccounts(): Promise<{
        address: string;
        total: number;
    }[]>;
    getPaginatedTransactions(page?: number, limit?: number): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        transactions: import("./entities/transactions.entity").Transaction[];
    }>;
    getLargestTransactions(limit: string): Promise<import("./entities/transactions.entity").Transaction[]>;
    getTransactionByHash(hash: string): Promise<import("./entities/transactions.entity").Transaction>;
}
