import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  
  @Catch(BadRequestException)
  export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationExceptionFilter.name);
  
    catch(exception: BadRequestException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
  
      // Log detailed validation errors
      this.logger.error(
        `Validation Error: ${JSON.stringify(exceptionResponse, null, 2)}`
      );
  
      // Log the request body for debugging purposes
      this.logger.log(`Request Body: ${JSON.stringify(request.body, null, 2)}`);
  
      // Send the response to the client
      response.status(status).json(exceptionResponse);
    }
  }
  