"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsdcModule = void 0;
const common_1 = require("@nestjs/common");
const usdc_service_1 = require("./usdc.service");
const transactions_module_1 = require("../transactions/transactions.module");
let UsdcModule = class UsdcModule {
};
exports.UsdcModule = UsdcModule;
exports.UsdcModule = UsdcModule = __decorate([
    (0, common_1.Module)({
        imports: [transactions_module_1.TransactionsModule],
        providers: [usdc_service_1.UsdcService],
        controllers: [],
        exports: [usdc_service_1.UsdcService],
    })
], UsdcModule);
//# sourceMappingURL=usdc.module.js.map