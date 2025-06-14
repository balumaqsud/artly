import { Module } from '@nestjs/common';
import { ArtlyBatchController } from './artly-batch.controller';
import { ArtlyBatchService } from './artly-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ArtlyBatchController],
  providers: [ArtlyBatchService],
})
export class ArtlyBatchModule {}
