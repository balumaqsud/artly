import { Controller, Get } from '@nestjs/common';
import { ArtlyBatchService } from './artly-batch.service';

@Controller()
export class ArtlyBatchController {
  constructor(private readonly artlyBatchService: ArtlyBatchService) {}

  @Get()
  getHello(): string {
    return this.artlyBatchService.getHello();
  }
}
