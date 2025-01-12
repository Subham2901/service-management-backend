import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MasterAgreementsController } from './master-agreements.controller';
import { MasterAgreementsService } from './master-agreements.service';
import { MasterAgreement, MasterAgreementSchema } from './schemas/master-agreement.schema';
import { MasterAgreementDetail, MasterAgreementDetailSchema } from './schemas/master-agreement-detail.schema';

@Module({
  imports: [
    HttpModule, // For making HTTP requests to external APIs
    ConfigModule, // For accessing environment variables (ensure it's global in AppModule)
    MongooseModule.forFeature([
      { name: MasterAgreement.name, schema: MasterAgreementSchema },
      { name: MasterAgreementDetail.name, schema: MasterAgreementDetailSchema },
    ]),
  ],
  controllers: [MasterAgreementsController],
  providers: [
    MasterAgreementsService,
    Logger, // Provide Logger for consistent logging across the module
  ],
  exports: [
    MasterAgreementsService, // Export for use in other modules, e.g., ServiceRequestsModule
  ],
})
export class MasterAgreementsModule {
  private readonly logger = new Logger(MasterAgreementsModule.name);

  constructor() {
    this.logger.log('MasterAgreementsModule initialized successfully');
  }
}
