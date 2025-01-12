import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('getHello() method accessed');
    const message = process.env.WELCOME_MESSAGE || 'Hello World!';
    return message;
  }
}
