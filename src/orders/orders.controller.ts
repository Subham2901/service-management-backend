import { Controller, Post, Get, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ensure authentication

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Create an order for a specific service request (PM Only)
  @Post('/create/:serviceRequestId')
  @ApiOperation({ summary: 'Create an order for a specific service request' })
  @ApiParam({ name: 'serviceRequestId', description: 'ID of the service request' })
  async createOrder(@Param('serviceRequestId') serviceRequestId: string) {
    return this.ordersService.createOrder(serviceRequestId);
  }

  // ✅ Get all orders (Admin/PM use case)
  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  // ✅ Get specific order details
  @Get('/specific-detail/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details of a specific order' })
  @ApiParam({ name: 'orderId', description: 'ID of the order' })
  async getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }

 // ✅ Get orders for a user (No Authentication)
 @Get('/user-orders/:userId')
 @ApiOperation({ summary: 'Fetch all orders for a specific user' })
 @ApiParam({ name: 'userId', description: 'ID of the user' })
 async getUserOrders(@Param('userId') userId: string) {
   return this.ordersService.getUserOrders(userId);
 }

 // ✅ Get orders for a PM (No Authentication)
 @Get('/pm-orders/:pmId')
 @ApiOperation({ summary: 'Fetch all orders for a specific PM' })
 @ApiParam({ name: 'pmId', description: 'ID of the PM' })
 async getPMOrders(@Param('pmId') pmId: string) {
   return this.ordersService.getPMOrders(pmId);
 }

 // ✅ Get specific order for a user (No Authentication)
 @Get('/user-orders/:userId/:orderId')
 @ApiOperation({ summary: 'Fetch a specific order for a user' })
 @ApiParam({ name: 'userId', description: 'ID of the user' })
 @ApiParam({ name: 'orderId', description: 'ID of the order' })
 async getUserOrderById(@Param('userId') userId: string, @Param('orderId') orderId: string) {
   return this.ordersService.getUserOrderById(userId, orderId);
 }

 // ✅ Get specific order for a PM (No Authentication)
 @Get('/pm-orders/:pmId/:orderId')
 @ApiOperation({ summary: 'Fetch a specific order for a PM' })
 @ApiParam({ name: 'pmId', description: 'ID of the PM' })
 @ApiParam({ name: 'orderId', description: 'ID of the order' })
 async getPMOrderById(@Param('pmId') pmId: string, @Param('orderId') orderId: string) {
   return this.ordersService.getPMOrderById(pmId, orderId);
 }

}
