import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { ServiceRequest, ServiceRequestSchema } from '../service-requests/schemas/service-request.schema';
import { Offer, OfferSchema } from '../offers/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]),
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
