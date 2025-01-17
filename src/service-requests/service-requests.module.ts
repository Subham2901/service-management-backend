/* import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { MasterAgreementsModule } from '../master-agreements/master-agreements.module'; // Import module

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]),
    MasterAgreementsModule, // Ensure this is imported
  ],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
 */
//New Module
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { MasterAgreementsModule } from '../master-agreements/master-agreements.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]),
    MasterAgreementsModule,
  ],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
