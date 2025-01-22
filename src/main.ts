/* import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production'; // Check environment

  try {
    const app = await NestFactory.create(AppModule, {
      logger: isProduction
        ? ['log', 'error', 'warn', 'debug'] // Enable all logs in production
        : ['log', 'error', 'warn', 'debug'], // Same logs for non-production
    });

    // Set global API prefix
    app.setGlobalPrefix('api');

    // Enable global validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // Automatically transform payloads to DTO instances
        whitelist: true, // Strip properties not included in the DTO
        forbidNonWhitelisted: true, // Throw error for properties not in the DTO
      }),
    );

    // Enable CORS for Railway frontend-backend communication
    app.enableCors({
      origin: '*', // Adjust this to your frontend URL in production
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    // Setup Swagger
    const config = new DocumentBuilder()
      .setTitle('Service Management System')
      .setDescription('API documentation for the Service Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // Railway uses the PORT environment variable
    const port = parseInt(process.env.PORT, 10) || 3000;

    // Start the application
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation is available at: http://localhost:${port}/api-docs`);
  } catch (error) {
    logger.error('Error during application initialization', error.stack);
    process.exit(1); // Exit with error code
  }


}
bootstrap();
 */
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationExceptionFilter } from './filters/validation-exception.filter'; // Import the custom exception filter

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production'; // Check environment

  try {
    const app = await NestFactory.create(AppModule, {
      logger: isProduction
        ? ['log', 'error', 'warn', 'debug'] // Enable all logs in production
        : ['log', 'error', 'warn', 'debug'], // Same logs for non-production
    });

    // Set global API prefix
    app.setGlobalPrefix('api');

    // Enable global validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // Automatically transform payloads to DTO instances
        whitelist: true, // Strip properties not included in the DTO
        forbidNonWhitelisted: true, // Throw error for properties not in the DTO
      }),
    );

    // Enable global exception filter for validation errors
    app.useGlobalFilters(new ValidationExceptionFilter());

    // Enable CORS for Railway frontend-backend communication
    app.enableCors({
      origin: '*', // Adjust this to your frontend URL in production
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    // Setup Swagger
    const config = new DocumentBuilder()
      .setTitle('Service Management System')
      .setDescription('API documentation for the Service Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // Railway uses the PORT environment variable
    const port = parseInt(process.env.PORT, 10) || 3000;

    // Start the application
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation is available at: http://localhost:${port}/api-docs`);
  } catch (error) {
    logger.error('Error during application initialization', error.stack);
    process.exit(1); // Exit with error code
  }
}
bootstrap();
