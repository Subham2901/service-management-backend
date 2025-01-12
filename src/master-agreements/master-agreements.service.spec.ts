import { Test, TestingModule } from '@nestjs/testing';
import { MasterAgreementsService } from './master-agreements.service';

describe('MasterAgreementsService', () => {
  let service: MasterAgreementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterAgreementsService],
    }).compile();

    service = module.get<MasterAgreementsService>(MasterAgreementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
