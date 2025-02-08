import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // INFO: This is my health check endpoint
  getHello(): string {
    return 'Hello World From Vlad!';
  }
}
