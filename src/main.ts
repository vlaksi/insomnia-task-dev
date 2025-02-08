import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Avalanche USDC Transfer Analyzer')
    .setDescription(
      'API for fetching, aggregating, and analyzing USDC transfers on the Avalanche blockchain.',
    )
    .setVersion('1.0')
    .addTag('USDC')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API Docs: http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
