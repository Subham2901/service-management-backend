import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { MasterAgreementsService } from '../master-agreements/master-agreements.service';

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);

  constructor(
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequest>,
    private readonly masterAgreementsService: MasterAgreementsService,
  ) {}

  /**
   * Utility to fetch a service request by ID with error handling.
   */
  private async getServiceRequestById(id: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestModel.findById(id);
    if (!request) {
      this.logger.error(`Service request with ID ${id} not found`);
      throw new NotFoundException('Service request not found');
    }
    return request;
  }

  /**
   * Create a new service request.
   */
  async create(data: CreateServiceRequestDto, createdBy: string): Promise<ServiceRequest> {
    this.logger.debug(`Creating service request for user: ${createdBy}`);
  
    try {
      const groupedDetails = await this.masterAgreementsService.fetchAndStoreAgreementDetails(data.agreementId);
      if (!groupedDetails.length) {
        throw new NotFoundException(`No details found for Master Agreement ID: ${data.agreementId}`);
      }
  
      const cycleDetails = {
        cycle1: groupedDetails
          .filter((detail) => detail.roleDetails.some((role) => role.cycle === 'cycle_one'))
          .flatMap((domain) => domain.roleDetails.map(({ providerId, providerName, price }) => ({
            providerId,
            providerName,
            price,
          }))),
        cycle2: groupedDetails
          .filter((detail) => detail.roleDetails.some((role) => role.cycle === 'cycle_two'))
          .flatMap((domain) => domain.roleDetails.map(({ providerId, providerName, price }) => ({
            providerId,
            providerName,
            price,
          }))),
      };
  
      const serviceRequest = new this.serviceRequestModel({
        ...data,
        createdBy,
        consumer: 'John Doe', // Replace with actual user session data
        cycleDetails,
        status: 'draft',
      });
  
      const result = await serviceRequest.save();
      this.logger.log(`Service request created successfully with ID: ${result._id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create service request');
    }
  }
  
  

  /**
   * Submit a service request.
   */
  async submit(id: string, userId: string): Promise<ServiceRequest> {
    const request = await this.getServiceRequestById(id);

    if (request.createdBy !== userId) {
      throw new ForbiddenException('You are not authorized to submit this service request');
    }

    request.status = 'submitted';
    try {
      const result = await request.save();
      this.logger.log(`Service request ID: ${id} submitted successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error submitting service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to submit service request');
    }
  }

  /**
   * Assign a service request to a PM.
   */
  async assignToSelf(id: string, pmId: string): Promise<ServiceRequest> {
    const request = await this.getServiceRequestById(id);

    if (request.providerManagerId) {
      throw new ForbiddenException('This service request is already assigned');
    }

    request.providerManagerId = pmId;
    request.status = 'assigned';
    try {
      const result = await request.save();
      this.logger.log(`Service request ID: ${id} assigned successfully to PM ${pmId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error assigning service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to assign service request');
    }
  }

  /**
   * Approve and publish a service request.
   */
  async approve(id: string, pmId: string, comment: string): Promise<ServiceRequest> {
    const request = await this.getServiceRequestById(id);
  
    if (request.providerManagerId !== pmId) {
      throw new ForbiddenException('You are not authorized to approve this service request');
    }
  
    request.status = 'published';
    request.notifications = request.notifications || []; // Ensure notifications field exists
    request.notifications.push(`Approved and published by PM: ${pmId}. Comment: ${comment}`);
    try {
      const result = await request.save();
      this.logger.log(`Service request ID: ${id} approved and published successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error approving service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to approve service request');
    }
  }
  /**
   * Fetch all published service requests.
   */
  async fetchPublished(): Promise<any> {
    try {
      const publishedRequests = await this.serviceRequestModel.find({ status: 'published' }).exec();
  
      const structuredRequests = publishedRequests.map((request) => ({
        ServiceRequestId: request._id,
        MasterAgreementDetails: {
          id: request.agreementId,
          name: request.agreementName,
        },
        TaskDescription: request.taskDescription,
        ProjectDescription: request.project,
        ProjectDuration: {
          start: request.begin,
          end: request.end,
        },
        ProjectLocation: request.location,
        type: request.type,
        SelectedDomains: request.selectedDomains,
        SelectedMembers: request.selectedMembers.map((member) => ({
          provider: {
            id: member.providerId,
            name: member.providerName,
          },
          role: member.role,
          level: member.level,
          technology: member.technology,
          price: member.price,
        })),
        cycleDetails: request.cycleDetails,
      }));
  
      this.logger.log(`Fetched ${structuredRequests.length} published service requests`);
      return structuredRequests;
    } catch (error) {
      this.logger.error(`Error fetching published service requests: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch published service requests');
    }
  }
  
/**
   * Fetch all service requests irrespective of their status.
   */
async fetchAll(): Promise<any> {
  try {
    const allRequests = await this.serviceRequestModel.find().exec();

    const groupedRequests = allRequests.reduce((acc, request) => {
      const statusGroup = acc[request.status] || [];
      statusGroup.push({
        ServiceRequestId: request._id,
        MasterAgreementDetails: {
          id: request.agreementId,
          name: request.agreementName,
        },
        TaskDescription: request.taskDescription,
        ProjectDescription: request.project,
        ProjectDuration: {
          start: request.begin,
          end: request.end,
        },
        ProjectLocation: request.location,
        type: request.type,
        SelectedDomains: request.selectedDomains,
        SelectedMembers: request.selectedMembers.map((member) => ({
          provider: {
            id: member.providerId,
            name: member.providerName,
          },
          role: member.role,
          level: member.level,
          technology: member.technology,
          price: member.price,
        })),
        cycleDetails: request.cycleDetails,
        notifications: request.notifications,
      });
      acc[request.status] = statusGroup;
      return acc;
    }, {});

    this.logger.log(`Fetched ${Object.keys(groupedRequests).length} categories of service requests`);
    return groupedRequests;
  } catch (error) {
    this.logger.error(`Error fetching all service requests: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Failed to fetch all service requests');
  }
}



  
}
