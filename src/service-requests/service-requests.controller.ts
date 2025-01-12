import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Logger,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ApproveServiceRequestDto } from './dto/approve-service-request.dto';

@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('service-requests')
export class ServiceRequestsController {
  private readonly logger = new Logger(ServiceRequestsController.name);

  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new service request' })
  @ApiBody({ type: CreateServiceRequestDto })
  async create(@Body() data: CreateServiceRequestDto, @Request() req) {
    this.logger.log(`Creating service request for user: ${req.user.id}`);
    return this.serviceRequestsService.create(data, req.user.id);
  }
  

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a service request' })
  @ApiParam({ name: 'id', description: 'Service Request ID to submit' })
  async submit(@Param('id') id: string, @Request() req) {
    this.logger.log(`Submitting service request ID: ${id}`);
    return this.serviceRequestsService.submit(id, req.user.id);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assign a service request to yourself' })
  @ApiParam({ name: 'id', description: 'Service Request ID to assign' })
  async assignToSelf(@Param('id') id: string, @Request() req) {
    this.logger.log(`Assigning service request ID: ${id}`);
    return this.serviceRequestsService.assignToSelf(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve and publish a service request' })
  @ApiParam({ name: 'id', description: 'Service Request ID to approve' })
  @ApiBody({ type: ApproveServiceRequestDto })
  async approve(@Param('id') id: string, @Body() body: ApproveServiceRequestDto, @Request() req) {
    this.logger.log(`Approving service request ID: ${id}`);
    return this.serviceRequestsService.approve(id, req.user.id, body.comment);
  }

  @Get('/published')
  @ApiOperation({ summary: 'Fetch all published service requests for providers' })
  async fetchPublished() {
    this.logger.log('Fetching all published service requests');
    return this.serviceRequestsService.fetchPublished();
  }
    @Get()
    @ApiOperation({ summary: 'Fetch all service requests irrespective of status' })
    async fetchAll() {
      this.logger.log('Fetching all service requests');
      return this.serviceRequestsService.fetchAll();
    }  
}
