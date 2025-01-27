import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer, OfferSchema } from './offer.schema';
import { HttpModule } from '@nestjs/axios';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]), // Register Offer schema
    HttpModule, // To enable API calls if required (e.g., fetching agreement details)
    ServiceRequestsModule, // Dependency to interact with Service Requests
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService], // Export if other modules need to use OffersService
})
export class OffersModule {}
