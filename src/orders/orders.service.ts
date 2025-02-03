import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { ServiceRequest } from '../service-requests/schemas/service-request.schema';
import { Offer } from '../offers/offer.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequest>,
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
  ) {}

  // ✅ Create an Order
  async createOrder(serviceRequestId: string): Promise<any> {
    this.logger.log(`Creating order for service request ID: ${serviceRequestId}`);

    // Fetch the service request
    const serviceRequest = await this.serviceRequestModel.findById(serviceRequestId);
    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID ${serviceRequestId} not found.`);
    }

    // Fetch all selected offers
    const selectedOffers = await this.offerModel.find({ serviceRequestId, status: 'Selected' }).exec();
    if (selectedOffers.length === 0) {
      throw new BadRequestException('No selected offers found to create an order.');
    }

    // Calculate total price
    const totalPrice = selectedOffers.reduce((sum, offer) => sum + (offer.price || 0), 0);

    // Create order
    const order = new this.orderModel({
      serviceRequestId,
      agreementId: serviceRequest.agreementId,
      agreementName: serviceRequest.agreementName,
      taskDescription: serviceRequest.taskDescription,
      type: serviceRequest.type,
      project: serviceRequest.project,
      begin: serviceRequest.begin,
      end: serviceRequest.end,
      amountOfManDays: serviceRequest.amountOfManDays,
      location: serviceRequest.location,
      informationForProviderManager: serviceRequest.informationForProviderManager,
      numberOfSpecialists: serviceRequest.numberOfSpecialists,
      consumer: serviceRequest.consumer,
      createdBy: serviceRequest.createdBy,
      approvedOffers: selectedOffers,
      totalPrice,
      status: 'OrderCreated',
    });

    await order.save();

    // Update service request status
    serviceRequest.status = 'OrderCreated';
    await serviceRequest.save();

    // Update offer statuses
    await this.offerModel.updateMany(
      { serviceRequestId, status: 'Selected' },
      { status: 'Approved' }
    );

    return {
      message: 'Order created successfully',
      order,
    };
  }

  // ✅ Get all Orders
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  // ✅ Get Specific Order by ID
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }
    return order;
  }

  async getUserOrders(userId: string) {
    const orders = await this.orderModel.find({ createdBy: userId }).exec();
    if (!orders.length) throw new NotFoundException('No orders found for this user');
    return orders;
  }
  
  async getPMOrders(pmId: string) {
    const orders = await this.orderModel.find({
      approvedOffers: { $elemMatch: { providerId: pmId } }
    }).exec();
    if (!orders.length) throw new NotFoundException('No orders found for this PM');
    return orders;
  }
  
  async getUserOrderById(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, createdBy: userId }).exec();
    if (!order) throw new NotFoundException('Order not found or unauthorized');
    return order;
  }
  
  async getPMOrderById(pmId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, approvedOffers: { $elemMatch: { providerId: pmId } } }).exec();
    if (!order) throw new NotFoundException('Order not found or unauthorized');
    return order;
  }
  
 
}
