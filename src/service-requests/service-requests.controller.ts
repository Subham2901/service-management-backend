
// new SERVICE REQUESTS CONTROLLER
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
import{RejectServiceRequestDto} from './dto/reject-service-request.dto';

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
    // Log the incoming request body
    this.logger.log(`Incoming Request Body: ${JSON.stringify(data, null, 2)}`);
    
    // Log the user making the request
    this.logger.log(`Creating service request for user: ${req.user.id}`);
  
    // Call the service to handle the request
    return this.serviceRequestsService.create(data, req.user.id);
  }


  // Directly submit a service request without saving as draft.
  @Post('directsubmit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Directly Submit a service request' })
  @ApiBody({ type: CreateServiceRequestDto })
  async directsubmit(@Body() data: CreateServiceRequestDto, @Request() req) {
    // Log the incoming request body
    this.logger.log(`Incoming Request Body: ${JSON.stringify(data, null, 2)}`);
    
    // Log the user making the request
    this.logger.log(`Creating service request for user: ${req.user.id}`);
  
    // Call the service to handle the request
    return this.serviceRequestsService.directsubmit(data, req.user.id);
  }






  
//Edit a draft service request.
@Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Edit a draft service request' })
@ApiParam({ name: 'id', description: 'Service Request ID to edit' })
@ApiBody({ type: CreateServiceRequestDto })
async editDraft(
  @Param('id') id: string,
  @Body() data: CreateServiceRequestDto,
  @Request() req,
) {
  this.logger.log(`Editing draft service request ID: ${id}`);
  return this.serviceRequestsService.editDraft(id, data, req.user.id);
}





//Fetches all draft service requests for a particular user.
@Get('/drafts')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Fetch all draft service requests for a user' })
async fetchDrafts(@Request() req) {
  this.logger.log(`Fetching drafts for user: ${req.user.id}`);
  return this.serviceRequestsService.fetchDrafts(req.user.id);
}





//Fetches all assigned service requests for a particular PM.
@Get('/assigned')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Fetch all assigned service requests for a PM' })
async fetchAssigned(@Request() req) {
  this.logger.log(`Fetching assigned service requests for PM: ${req.user.id}`);
  return this.serviceRequestsService.fetchAssigned(req.user.id);
}



//Fetches all approved service requests by a particular PM.
@Get('/approved')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Fetch all approved service requests by a PM' })
async fetchApproved(@Request() req) {
  this.logger.log(`Fetching approved service requests by PM: ${req.user.id}`);
  return this.serviceRequestsService.fetchApproved(req.user.id);
}






// Controller: Fetch a specific service request for a PM by ID
@Get(':id/details')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get details of a specific service request by ID' })
@ApiParam({ name: 'id', description: 'The ID of the service request' })
async getServiceRequestDetails(@Param('id') id: string) {
  this.logger.log(`Fetching details of service request with ID: ${id}`);
  return await this.serviceRequestsService.getServiceRequestDetails(id);
}
  



// Sumbit a service request
@Patch(':id/submit')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Submit a service request with updated fields and resubmission comment' })
@ApiParam({ name: 'id', description: 'Service Request ID to submit' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      taskDescription: { type: 'string', example: 'Updated task description for the project' },
      project: { type: 'string', example: 'New Project Name' },
      begin: { type: 'string', format: 'date', example: '2025-02-01' },
      end: { type: 'string', format: 'date', example: '2025-02-15' },
      location: { type: 'string', example: 'Updated location details' },
      locationType: { type: 'string', enum: ['Onshore', 'Nearshore', 'Farshore'], example: 'Onshore' },
      numberOfOffers: { type: 'number', example: 5 },
      representatives: { type: 'array', items: { type: 'string' }, example: ['John Doe', 'Jane Smith'] },
      informationForProviderManager: { type: 'string', example: 'Additional details for the provider manager' },
      selectedMembers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domainName: { type: 'string', example: 'Frontend Development' },
            role: { type: 'string', example: 'Developer' },
            level: { type: 'string', example: 'Senior' },
            technologyLevel: { type: 'string', example: 'React' },
            numberOfProfilesNeeded: { type: 'number', example: 2 }
          }
        }
      },
      comment: { type: 'string', example: 'Updated details and ready for resubmission.' }
    },
    required: ['comment']
  },
})
async submit(
  @Param('id') id: string,
  @Body() resubmissionData: any,
  @Request() req,
) {
  this.logger.log(`Submitting service request ID: ${id} with updated fields and resubmission comment.`);
  return this.serviceRequestsService.submit(id, req.user.id, resubmissionData);
}



  @Post(':id/manage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch, update, or submit a draft' })
  @ApiParam({ name: 'id', description: 'Service Request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['fetch', 'update', 'submit'],
          description: 'Operation to perform',
        },
        fieldsToUpdate: {
          type: 'object',
          description: 'Fields to update for the draft (only for update operation)',
        },
        comments: {
          type: 'string',
          description: 'Optional comments for submission',
        },
      },
    },
  })
  async manageServiceRequest(
    @Param('id') id: string,
    @Body() body: { operation: 'fetch' | 'update' | 'submit'; fieldsToUpdate?: Partial<CreateServiceRequestDto>; comments?: string },
    @Request() req,
  ) {
    const { operation, fieldsToUpdate, comments } = body;
    return this.serviceRequestsService.manageServiceRequest(id, operation, fieldsToUpdate, req.user.id, comments);
  }


  //assign a server request to yourself as a PM

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assign a service request to yourself' })
  @ApiParam({ name: 'id', description: 'Service Request ID to assign' })
  async assignToSelf(@Param('id') id: string, @Request() req) {
    this.logger.log(`Assigning service request ID: ${id}`);
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming the role is provided in the JWT payload
    return this.serviceRequestsService.assignToSelf(id, userId, userRole);
  }





  
  // fetch and approve the service request.

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve and publish a service request' })
  @ApiParam({ name: 'id', description: 'Service Request ID to approve' })
  @ApiBody({ type: ApproveServiceRequestDto })
  async approve(@Param('id') id: string, @Body() body: ApproveServiceRequestDto, @Request() req) {
    this.logger.log(`Approving service request ID: ${id}`);
    return this.serviceRequestsService.approve(id, req.user.id, body.comment);
  }




  //fetch all the published service request.

  @Get('/published')
  @ApiOperation({ summary: 'Fetch all published service requests for providers' })
  async fetchPublished() {
    this.logger.log('Fetching all published service requests');
    return this.serviceRequestsService.fetchPublished();
  }



  // Fetching all the service request irrespective of the status.

  @Get()
  @ApiOperation({ summary: 'Fetch all service requests irrespective of status' })
  async fetchAll() {
    this.logger.log('Fetching all service requests');
    return this.serviceRequestsService.fetchAll();
  }


//Rejecting a service request by a PM

@Patch(':id/reject')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Reject a service request with comments' })
@ApiParam({ name: 'id', description: 'Service Request ID to reject' })
@ApiBody({ type: RejectServiceRequestDto })
async reject(
  @Param('id') id: string,
  @Body() body: RejectServiceRequestDto,
  @Request() req,
) {
  this.logger.log(`Rejecting service request ID: ${id}`);
  return this.serviceRequestsService.reject(id, req.user.id, body.comment);
}

//API TO fetch all the service requests for a particular User.
@Get('/user-requests/:status')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Fetch all service requests for a user with a specific status' })
@ApiParam({
  name: 'status',
  required: true,
  description: 'Filter by status (e.g., draft, submitted, rejected)',
})
async fetchUserRequestsByStatus(
  @Request() req,
  @Param('status') status: string // Using @Param to get the status from the URL
): Promise<any> {
  const userId = req.user.id;
  return this.serviceRequestsService.fetchUserRequests(userId, status);
}

}

