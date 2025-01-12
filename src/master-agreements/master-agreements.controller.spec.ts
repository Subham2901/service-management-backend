import { Test, TestingModule } from '@nestjs/testing';
import { MasterAgreementsController } from './master-agreements.controller';

describe('MasterAgreementsController', () => {
  let controller: MasterAgreementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterAgreementsController],
    }).compile();

    controller = module.get<MasterAgreementsController>(MasterAgreementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
