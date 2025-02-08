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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TransactionDto {
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction Hash', example: '0x123abc...' }),
    __metadata("design:type", String)
], TransactionDto.prototype, "transactionHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Block Number', example: 12345678 }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "blockNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Block Timestamp (UTC)',
        example: '2025-02-06T10:43:58.000Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction Index within Block', example: 5 }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "transactionIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender Address', example: '0xABCDEF123456...' }),
    __metadata("design:type", String)
], TransactionDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Receiver Address',
        example: '0xFEDCBA654321...',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "receiver", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount Transferred in USDC', example: '150.00' }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "amount", void 0);
//# sourceMappingURL=transaction.dto.js.map