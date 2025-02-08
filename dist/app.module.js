"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transactions_module_1 = require("./transactions/transactions.module");
const usdc_module_1 = require("./usdc/usdc.module");
const transactions_entity_1 = require("./transactions/entities/transactions.entity");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
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
                entities: [transactions_entity_1.Transaction],
                synchronize: true,
            }),
            transactions_module_1.TransactionsModule,
            usdc_module_1.UsdcModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map