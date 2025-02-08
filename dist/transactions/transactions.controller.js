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
var TransactionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const swagger_1 = require("@nestjs/swagger");
let TransactionsController = TransactionsController_1 = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
        this.logger = new common_1.Logger(TransactionsController_1.name);
    }
    async getTotalTransferred(interval) {
        try {
            const parsedInterval = parseInt(interval, 10);
            if (isNaN(parsedInterval) || parsedInterval <= 0 || parsedInterval < 5) {
                throw new common_1.BadRequestException('Invalid interval. Must be a positive number greater or equal to 5.');
            }
            const totalUSDC = await this.transactionsService.getTotalTransferred(parsedInterval);
            return { totalUSDC };
        }
        catch (error) {
            this.logger.error('Failed to fetch total transferred USDC', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while fetching total USDC transferred.');
        }
    }
    async getTopAccounts() {
        return await this.transactionsService.getTopAccounts();
    }
    async getPaginatedTransactions(page, limit) {
        try {
            const parsedPage = Number(page);
            const parsedLimit = Number(limit);
            if (isNaN(parsedPage) ||
                isNaN(parsedLimit) ||
                parsedPage < 1 ||
                parsedLimit < 1) {
                throw new common_1.BadRequestException('Page and limit must be positive integers.');
            }
            return await this.transactionsService.getPaginatedTransactions(parsedPage, parsedLimit);
        }
        catch (error) {
            this.logger.error('Failed to fetch paginated transactions', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while fetching paginated transactions.');
        }
    }
    async getLargestTransactions(limit) {
        try {
            const parsedLimit = parseInt(limit, 10);
            if (isNaN(parsedLimit) || parsedLimit <= 0) {
                throw new common_1.BadRequestException('Limit must be a positive integer.');
            }
            return await this.transactionsService.getLargestTransactions(parsedLimit);
        }
        catch (error) {
            this.logger.error('Failed to fetch largest transactions', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while fetching largest transactions.');
        }
    }
    async getTransactionByHash(hash) {
        try {
            if (!hash || hash.length !== 66) {
                throw new common_1.BadRequestException('Invalid transaction hash format.');
            }
            const transaction = await this.transactionsService.getTransactionByHash(hash);
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found.');
            }
            return transaction;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch transaction details.');
        }
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)('/total-transferred'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get total USDC transferred in a given time interval',
        description: 'Fetches the total amount of USDC transferred within the given time period (in minutes).',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'interval',
        type: Number,
        required: true,
        description: 'Time period in minutes (e.g., 5, 10, 30, 40, 60, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the total USDC transferred in the given interval.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid interval value.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error - Unexpected failure while fetching data.',
    }),
    __param(0, (0, common_1.Query)('interval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTotalTransferred", null);
__decorate([
    (0, common_1.Get)('top-accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTopAccounts", null);
__decorate([
    (0, common_1.Get)('paginated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get paginated transactions',
        description: 'Fetches a paginated list of transactions, ordered by timestamp in descending order.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        example: 10,
        description: 'Number of transactions per page (default: 10)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated transactions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid query parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getPaginatedTransactions", null);
__decorate([
    (0, common_1.Get)('largest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get largest transactions' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Number of largest transactions to return (default: 10)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the largest transactions sorted by amount.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid limit value.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getLargestTransactions", null);
__decorate([
    (0, common_1.Get)(':hash'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction details by hash' }),
    (0, swagger_1.ApiParam)({
        name: 'hash',
        required: true,
        description: 'Transaction hash to fetch details',
        example: '0x805fd751b9db9923985ae916b8319cecd9a9226e55f3282ee281b5cee606e5c1',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the transaction details.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid transaction hash format.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionByHash", null);
exports.TransactionsController = TransactionsController = TransactionsController_1 = __decorate([
    (0, swagger_1.ApiTags)('USDC Transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map