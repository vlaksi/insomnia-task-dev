"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transactions_entity_1 = require("./entities/transactions.entity");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
        this.logger = new common_1.Logger(TransactionsService_1.name);
    }
    async saveTransactions(transactions) {
        try {
            if (!transactions.length) {
                this.logger.warn('No transactions to save.');
                return;
            }
            const transactionHashes = transactions.map((tx) => tx.transactionHash);
            const existingTransactions = await this.transactionsRepository.find({
                where: { transactionHash: (0, typeorm_2.In)(transactionHashes) },
                select: ['transactionHash'],
            });
            const existingTransactionHashes = new Set(existingTransactions.map((tx) => tx.transactionHash));
            const newTransactions = transactions.filter((tx) => !existingTransactionHashes.has(tx.transactionHash));
            if (newTransactions.length > 0) {
                try {
                    await this.transactionsRepository
                        .createQueryBuilder()
                        .insert()
                        .into('transaction')
                        .values(newTransactions)
                        .orIgnore()
                        .execute();
                    this.logger.log(`Saved ${newTransactions.length} new transactions.`);
                }
                catch (error) {
                    this.logger.error('Error inserting transactions', error);
                    throw new common_1.InternalServerErrorException('An error occurred while saving transactions.');
                }
            }
            else {
                this.logger.warn('No new transactions to save (all were duplicates).');
            }
        }
        catch (error) {
            this.logger.error('Error saving transactions', error);
            throw new common_1.InternalServerErrorException('An error occurred while saving transactions.');
        }
    }
    async getLastTransaction() {
        try {
            const lastTransaction = await this.transactionsRepository.findOne({
                where: {},
                order: { blockNumber: 'DESC' },
            });
            if (lastTransaction) {
                this.logger.debug(`Last transaction found: ${lastTransaction.transactionHash}`);
            }
            else {
                this.logger.warn('No transactions found in the database.');
            }
            return lastTransaction;
        }
        catch (error) {
            this.logger.error('Error fetching last transaction', error);
            throw new common_1.InternalServerErrorException('An error occurred while retrieving the last transaction.');
        }
    }
    async getTotalTransferred(intervalInMinutes) {
        try {
            if (!intervalInMinutes ||
                isNaN(intervalInMinutes) ||
                intervalInMinutes < 5) {
                throw new common_1.BadRequestException('Invalid interval. Must be a positive number greater or equal to 5.');
            }
            const cutoffTime = new Date(Date.now() - intervalInMinutes * 60 * 1000);
            const result = await this.transactionsRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amount)', 'total')
                .where('transaction.timestamp >= :cutoffTime', { cutoffTime })
                .getRawOne();
            return result?.total || 0;
        }
        catch (error) {
            this.logger.error('Failed to calculate total USDC transferred', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An error occurred while fetching total USDC transferred.');
        }
    }
    async getTopAccounts() {
        return await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select('transaction.receiver', 'address')
            .addSelect('SUM(transaction.amount)', 'total')
            .groupBy('transaction.receiver')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();
    }
    async getPaginatedTransactions(page, limit) {
        try {
            if (!Number.isInteger(page) ||
                page < 1 ||
                !Number.isInteger(limit) ||
                limit < 1) {
                this.logger.warn(`Invalid pagination parameters: page=${page}, limit=${limit}`);
                throw new common_1.BadRequestException('Page and limit must be positive integers.');
            }
            this.logger.log(`Fetching paginated transactions: page=${page}, limit=${limit}`);
            const [transactions, total] = await this.transactionsRepository.findAndCount({
                take: limit,
                skip: (page - 1) * limit,
                order: { timestamp: 'DESC' },
            });
            const totalPages = Math.ceil(total / limit);
            this.logger.debug(`Fetched ${transactions.length} transactions, total: ${total}, totalPages: ${totalPages}`);
            return { page, limit, total, totalPages, transactions };
        }
        catch (error) {
            this.logger.error('Error fetching paginated transactions', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An error occurred while fetching paginated transactions.');
        }
    }
    async getTransactionByHash(hash) {
        try {
            return await this.transactionsRepository.findOne({
                where: { transactionHash: hash },
            });
        }
        catch (error) {
            this.logger.error('Error fetching transaction by hash', error);
            throw new Error('Database query failed');
        }
    }
    async getLargestTransactions(limit) {
        try {
            return await this.transactionsRepository.find({
                order: { amount: 'DESC' },
                take: limit,
            });
        }
        catch (error) {
            this.logger.error('Error fetching largest transactions', error);
            throw new Error('Database query failed');
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transactions_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map