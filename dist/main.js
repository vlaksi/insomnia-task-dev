"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Avalanche USDC Transfer Analyzer')
        .setDescription('API for fetching, aggregating, and analyzing USDC transfers on the Avalanche blockchain.')
        .setVersion('1.0')
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, documentFactory);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📚 Swagger API Docs: http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
    console.error('Error during bootstrap:', error);
});
//# sourceMappingURL=main.js.map