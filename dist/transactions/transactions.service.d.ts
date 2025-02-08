import { Repository } from 'typeorm';
import { Transaction } from './entities/transactions.entity';
import { TransactionDto } from './dto/transaction.dto';
export declare class TransactionsService {
    private transactionsRepository;
    private readonly logger;
    constructor(transactionsRepository: Repository<Transaction>);
    saveTransactions(transactions: TransactionDto[]): Promise<void>;
    getLastTransaction(): Promise<Transaction | null>;
    getTotalTransferred(intervalInMinutes: number): Promise<number>;
    getTopAccounts(): Promise<{
        address: string;
        total: number;
    }[]>;
    getPaginatedTransactions(page: number, limit: number): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        transactions: Transaction[];
    }>;
    getTransactionByHash(hash: string): Promise<Transaction | null>;
    getLargestTransactions(limit: number): Promise<Transaction[]>;
}
