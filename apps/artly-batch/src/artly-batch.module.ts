import { Module } from '@nestjs/common';
import { ArtlyBatchController } from './artly-batch.controller';
import { ArtlyBatchService } from './artly-batch.service';

@Module({
  imports: [],
  controllers: [ArtlyBatchController],
  providers: [ArtlyBatchService],
})
export class ArtlyBatchModule {}
