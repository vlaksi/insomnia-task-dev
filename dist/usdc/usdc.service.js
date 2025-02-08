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
var UsdcService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsdcService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const schedule_1 = require("@nestjs/schedule");
const dotenv = require("dotenv");
const transactions_service_1 = require("../transactions/transactions.service");
dotenv.config();
let UsdcService = UsdcService_1 = class UsdcService {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
        this.logger = new common_1.Logger(UsdcService_1.name);
        this.usdcAddress = process.env.USDC_CONTRACT;
        this.TRANSACTION_LIMIT = 500;
        try {
            this.provider = new ethers_1.ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
            const usdcAbi = [
                'event Transfer(address indexed from, address indexed to, uint256 amount)',
            ];
            if (!this.usdcAddress) {
                throw new Error('USDC contract address is not defined');
            }
            this.usdcContract = new ethers_1.ethers.Contract(this.usdcAddress, usdcAbi, this.provider);
        }
        catch (error) {
            this.logger.error('Failed to initialize USDC contract:', error);
            throw new Error('Failed to initialize USDC contract.');
        }
    }
    async onModuleInit() {
        await this.getAndStoreTransactions();
    }
    async getLatestBlock() {
        try {
            return await this.provider.getBlockNumber();
        }
        catch (error) {
            this.logger.error('Error fetching latest block number:', error);
            throw new Error('Could not fetch latest block number.');
        }
    }
    async getLastStoredBlock() {
        try {
            const lastTransaction = await this.transactionsService.getLastTransaction();
            return lastTransaction
                ? lastTransaction.blockNumber
                : await this.getLatestBlock();
        }
        catch (error) {
            this.logger.error('Error fetching last stored block:', error);
            throw new Error('Could not determine last stored block.');
        }
    }
    async saveTransactions(transactions) {
        try {
            await this.transactionsService.saveTransactions(transactions);
            this.logger.log(`Successfully saved ${transactions.length} transactions.`);
        }
        catch (dbError) {
            this.logger.error('Error saving transactions:', dbError);
            throw new Error('Failed to save transactions.');
        }
    }
    async processTransferEvents(events) {
        this.logger.log(`Found ${events.length} USDC transfer events.`);
        const transactions = [];
        for (const event of events) {
            try {
                const block = await this.provider.getBlock(event.blockNumber);
                if (!block) {
                    throw new Error(`Block ${event.blockNumber} not found.`);
                }
                const timestamp = block ? new Date(block.timestamp * 1000) : null;
                const amount = event.args[2];
                transactions.push({
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    timestamp,
                    transactionIndex: event.transactionIndex,
                    sender: ethers_1.ethers.getAddress('0x' + event.topics[1].slice(26)),
                    receiver: ethers_1.ethers.getAddress('0x' + event.topics[2].slice(26)),
                    amount: Number(ethers_1.ethers.formatUnits(amount, 6)),
                });
            }
            catch (eventError) {
                this.logger.error(`Error processing event ${event.transactionHash}:`, eventError);
            }
        }
        return transactions;
    }
    async getAndStoreTransactions() {
        try {
            const lastStoredBlock = await this.getLastStoredBlock();
            const latestBlock = await this.getLatestBlock();
            let fromBlock;
            if (lastStoredBlock === latestBlock) {
                fromBlock = latestBlock - this.TRANSACTION_LIMIT;
            }
            else {
                fromBlock = lastStoredBlock + 1;
            }
            this.logger.log(`Fetching transfers from block ${fromBlock} to ${latestBlock}`);
            if (fromBlock > latestBlock) {
                this.logger.log('No USDC transfer events found.');
                return;
            }
            const toBlock = Math.min(fromBlock + this.TRANSACTION_LIMIT, latestBlock);
            const events = (await this.usdcContract.queryFilter(this.usdcContract.filters.Transfer(), fromBlock, toBlock));
            if (!events.length) {
                this.logger.log('No USDC transfer events found in the given range.');
                return;
            }
            const transactions = await this.processTransferEvents(events);
            try {
                await this.saveTransactions(transactions);
            }
            catch (dbError) {
                this.logger.error('Error saving transactions:', dbError);
                throw new Error('Failed to save transactions.');
            }
        }
        catch (error) {
            this.logger.error('Failed to fetch and store transactions:', error);
            throw new Error('Unexpected error while fetching transactions.');
        }
    }
};
exports.UsdcService = UsdcService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsdcService.prototype, "getAndStoreTransactions", null);
exports.UsdcService = UsdcService = UsdcService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], UsdcService);
//# sourceMappingURL=usdc.service.js.map