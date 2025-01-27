import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { ApproveOfferDto } from './dto/approve-offer.dto';
import { RejectOfferDto } from './dto/reject-offer.dto';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './offer.schema'; // Import Offer schema
import { ServiceRequest } from '../service-requests/schemas/service-request.schema'; // Import ServiceRequest schema

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly serviceRequestsService: ServiceRequestsService,
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>, // Inject Offer model
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequest> // Inject ServiceRequest model
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate offers for a specific service request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceRequestId: { type: 'string', description: 'ID of the service request' },
      },
      required: ['serviceRequestId'],
    },
  })
  async generateOffers(@Body() body: { serviceRequestId: string }) {
    const { serviceRequestId } = body;

    // Fetch service request details by ID
    const serviceRequest = await this.serviceRequestsService.getServiceRequestDetails(serviceRequestId);

    // Log the service request and its details
    console.log(`Generating offers for ServiceRequest: ${serviceRequestId}`, serviceRequest);

    // Generate offers based on the service request details
    return this.offersService.generateOffers(serviceRequest);
  }

  @Get(':serviceRequestId')
  @ApiOperation({ summary: 'Get offers for a specific service request' })
  @ApiParam({ name: 'serviceRequestId', description: 'ID of the service request' })
  async getOffersByServiceRequest(
    @Param('serviceRequestId') serviceRequestId: string,
  ) {
    const offers = await this.offersService.getOffersByServiceRequestId(serviceRequestId);
    if (!offers || offers.length === 0) {
      throw new NotFoundException(`No offers found for Service Request ID ${serviceRequestId}`);
    }
    return offers;
  }

  @Post('select')
  @ApiOperation({ summary: 'Select an offer for PM evaluation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        offerId: { type: 'string', description: 'ID of the offer to select' },
      },
      required: ['offerId'],
    },
  })
  async selectOffer(@Body() body: { offerId: string }) {
    return this.offersService.selectOffer(body.offerId);
  }

  @Get('/selected/:serviceRequestId')
  @ApiOperation({ summary: 'Fetch selected offers for a service request' })
  @ApiParam({ name: 'serviceRequestId', description: 'ID of the service request' })
  async getSelectedOffers(@Param('serviceRequestId') serviceRequestId: string) {
    return this.offersService.getSelectedOffers(serviceRequestId);
  }

  @Patch(':id/evaluate')
  @ApiOperation({ summary: 'Evaluate an offer (Approve or Reject)' })
  @ApiParam({ name: 'id', description: 'ID of the offer to evaluate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['Approved', 'Rejected'], description: 'Status to update the offer to' },
        comment: { type: 'string', description: 'Optional comment for the decision' },
      },
    },
  })
  async evaluateOffer(
    @Param('id') id: string,
    @Body() { status, comment }: { status: 'Approved' | 'Rejected'; comment?: string }
  ) {
    return this.offersService.evaluateOffer(id, status, comment);
  }

  @Patch(':serviceRequestId/send-for-pm-evaluation')
  @ApiOperation({ summary: 'Send service request for PM evaluation' })
  @ApiParam({ name: 'serviceRequestId', description: 'ID of the service request to send for PM evaluation' })
  async sendForPmEvaluation(@Param('serviceRequestId') serviceRequestId: string) {
    const serviceRequest = await this.serviceRequestModel.findById(serviceRequestId);
    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID ${serviceRequestId} not found.`);
    }

    // Check if all the selected members have at least one selected offer
    const allOffers = await this.offerModel.find({ serviceRequestId }).exec();
    const hasAtLeastOneSelectedForEachMember = serviceRequest.selectedMembers.every((member) => {
      const offersForMember = allOffers.filter((offer) => offer.domainId === member.domainId && offer.role === member.role);
      return offersForMember.some((offer) => offer.status === 'Selected');
    });

    if (!hasAtLeastOneSelectedForEachMember) {
      throw new BadRequestException('Not all members have selected offers.');
    }

    // Change the service request status to "PmOfferEvaluation"
    serviceRequest.status = 'PmOfferEvaluation';
    await serviceRequest.save();

    return {
      message: 'Service request sent for PM evaluation successfully',
      serviceRequest,
    };
  }


  @Patch(':id/revise')
@ApiOperation({ summary: 'Request a revision for the offer (Price revision by provider)' })
@ApiParam({ name: 'id', description: 'ID of the offer to request a revision for' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      comment: { type: 'string', description: 'Comment from the PM asking for revision' },
    },
    required: ['comment'],
  },
})
async reviseOffer(
  @Param('id') id: string,
  @Body() { comment }: { comment: string }
) {
  const offer = await this.offerModel.findById(id);
  if (!offer) {
    throw new NotFoundException(`Offer with ID ${id} not found`);
  }

  if (offer.status === 'Approved') {
    throw new BadRequestException('This offer is already approved and cannot be revised.');
  }

  offer.status = 'Revisions Requested';
  offer.comments = comment;
  await offer.save();

  return {
    message: 'Offer revision requested successfully',
    offer,
  };
}
@Patch(':serviceRequestId/cycle-status')
@ApiOperation({ summary: 'Update cycle status for a service request' })
@ApiParam({ name: 'serviceRequestId', description: 'ID of the service request' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      cycleStatus: { type: 'string', description: 'New cycle status' },
    },
    required: ['cycleStatus'],
  },
})
async updateCycleStatus(
  @Param('serviceRequestId') serviceRequestId: string,
  @Body() { cycleStatus }: { cycleStatus: string },
) {
  const serviceRequest = await this.serviceRequestModel.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new NotFoundException(`Service request with ID ${serviceRequestId} not found.`);
  }

  serviceRequest.cycleStatus = cycleStatus;
  await serviceRequest.save();

  return {
    message: `Cycle status updated to ${cycleStatus} successfully`,
    serviceRequest,
  };
}
@Patch(':serviceRequestId/status')
@ApiOperation({ summary: 'Update the status of a service request' })
@ApiParam({ name: 'serviceRequestId', description: 'ID of the service request' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      status: { type: 'string', description: 'New status to update the service request to' },
    },
    required: ['status'],
  },
})
async updateServiceRequestStatus(
  @Param('serviceRequestId') serviceRequestId: string,
  @Body() { status }: { status: string },
) {
  // Fetch the service request by ID
  const serviceRequest = await this.serviceRequestModel.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new NotFoundException(`Service request with ID ${serviceRequestId} not found.`);
  }

  // Validate the status (you can customize this list based on your application's needs)
  const validStatuses = ['published', 'PmOfferEvaluation', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(`Invalid status provided. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  // Update the status of the service request
  serviceRequest.status = status;
  await serviceRequest.save();

  return {
    message: `Service request status updated to ${status} successfully`,
    serviceRequest,
  };
}





}
