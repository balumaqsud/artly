import { Test, TestingModule } from '@nestjs/testing';
import { ArtlyBatchController } from './artly-batch.controller';
import { ArtlyBatchService } from './artly-batch.service';

describe('ArtlyBatchController', () => {
  let artlyBatchController: ArtlyBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArtlyBatchController],
      providers: [ArtlyBatchService],
    }).compile();

    artlyBatchController = app.get<ArtlyBatchController>(ArtlyBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(artlyBatchController.getHello()).toBe('Hello World!');
    });
  });
});
