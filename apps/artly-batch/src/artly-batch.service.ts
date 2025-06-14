import { Injectable } from '@nestjs/common';

@Injectable()
export class ArtlyBatchService {
  getHello(): string {
    return 'Hello World!';
  }
}
