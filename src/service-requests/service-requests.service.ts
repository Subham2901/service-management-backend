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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);
  private readonly baseUrl = 'https://agiledev-contractandprovidermana-production.up.railway.app';

  constructor(
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequest>,
    private readonly httpService: HttpService,
  ) {}

// ServiceRequestsService
async getServiceRequestDetails(id: string): Promise<ServiceRequest> {
  return await this.getServiceRequestById(id); // Use the private utility method
}



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
  async create(data: CreateServiceRequestDto, createdBy: string): Promise<any> {
    this.logger.debug(`Creating service request for user: ${createdBy}`);

    try {
      const agreementsResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/master-agreements/established-agreements`),
      );
      const agreements = agreementsResponse.data;

      const validAgreement = agreements.find(
        (agreement: any) => agreement.agreementId === data.agreementId,
      );

      if (!validAgreement) {
        throw new NotFoundException(`Agreement ID ${data.agreementId} is not valid.`);
      }

      const agreementName = validAgreement.name;

      const detailsResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/master-agreements/established-agreements/${data.agreementId}`),
      );
      const agreementDetails = detailsResponse.data;

      const mappedMembers = data.selectedMembers.map((member) => {
        const matchedDomain = agreementDetails.find(
          (domain: any) => domain.domainId === member.domainId,
        );

        if (!matchedDomain) {
          throw new NotFoundException(`Domain with ID ${member.domainId} not found in agreement details.`);
        }

        const matchedRole = matchedDomain.roleDetails.find(
          (role: any) =>
            role.role === member.role &&
            role.level === member.level &&
            role.technologyLevel === member.technologyLevel,
        );

        if (!matchedRole) {
          throw new NotFoundException(
            `Role ${member.role} with specified details not found in domain ${member.domainName}.`,
          );
        }

        return {
          ...member,
          roleId: matchedRole.roleId,
        };
      });

      const totalSpecialists = mappedMembers.reduce(
        (sum, member) => sum + (member.numberOfProfilesNeeded || 0),
        0,
      );

      const serviceRequest = new this.serviceRequestModel({
        ...data,
        agreementName,
        selectedMembers: mappedMembers,
        numberOfSpecialists: totalSpecialists,
        createdBy,
        cycleStatus: 'cycle1',
        status: 'draft',
      });

      const result = await serviceRequest.save();

      this.logger.log(`Service request created successfully with ID: ${result._id}`);

      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;

      return transformedResult;
    } catch (error) {
      this.logger.error(`Error creating service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create service request');
    }
  }



   /**
   *Directly create and submit a new service request.
   */
   async directsubmit(data: CreateServiceRequestDto, createdBy: string): Promise<any> {
    this.logger.debug(`Creating service request for user: ${createdBy}`);

    try {
      const agreementsResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/master-agreements/established-agreements`),
      );
      const agreements = agreementsResponse.data;

      const validAgreement = agreements.find(
        (agreement: any) => agreement.agreementId === data.agreementId,
      );

      if (!validAgreement) {
        throw new NotFoundException(`Agreement ID ${data.agreementId} is not valid.`);
      }

      const agreementName = validAgreement.name;

      const detailsResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/master-agreements/established-agreements/${data.agreementId}`),
      );
      const agreementDetails = detailsResponse.data;

      const mappedMembers = data.selectedMembers.map((member) => {
        const matchedDomain = agreementDetails.find(
          (domain: any) => domain.domainId === member.domainId,
        );

        if (!matchedDomain) {
          throw new NotFoundException(`Domain with ID ${member.domainId} not found in agreement details.`);
        }

        const matchedRole = matchedDomain.roleDetails.find(
          (role: any) =>
            role.role === member.role &&
            role.level === member.level &&
            role.technologyLevel === member.technologyLevel,
        );

        if (!matchedRole) {
          throw new NotFoundException(
            `Role ${member.role} with specified details not found in domain ${member.domainName}.`,
          );
        }

        return {
          ...member,
          roleId: matchedRole.roleId,
        };
      });

      const totalSpecialists = mappedMembers.reduce(
        (sum, member) => sum + (member.numberOfProfilesNeeded || 0),
        0,
      );

      const serviceRequest = new this.serviceRequestModel({
        ...data,
        agreementName,
        selectedMembers: mappedMembers,
        numberOfSpecialists: totalSpecialists,
        createdBy,
        cycleStatus: 'cycle1',
        status: 'submitted',
      });

      const result = await serviceRequest.save();

      this.logger.log(`Service request created successfully with ID: ${result._id}`);

      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;

      return transformedResult;
    } catch (error) {
      this.logger.error(`Error creating service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create service request');
    }
  }




  /**
   * Submit a service request.
   */
  async submit(id: string, userId: string): Promise<any> {
    const request = await this.getServiceRequestById(id);

    if (request.createdBy !== userId) {
      throw new ForbiddenException('You are not authorized to submit this service request');
    }

    request.status = 'submitted';

    try {
      const result = await request.save();

      this.logger.log(`Service request ID: ${id} submitted successfully`);

      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;

      return transformedResult;
    } catch (error) {
      this.logger.error(`Error submitting service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to submit service request');
    }
  }

  //Assign a service request to yourself as a PM
  async assignToSelf(id: string, userId: string, userRole: string): Promise<any> {
    if (userRole !== 'PM') {
      throw new ForbiddenException('Only users with the PM role can assign service requests.');
    }
  
    const request = await this.getServiceRequestById(id);
  
    if (request.providerManagerId) {
      throw new ForbiddenException('This service request is already assigned.');
    }
  
    request.providerManagerId = userId;
    request.status = 'assigned';
    request.notifications.push(`Assigned to PM: ${userId}`);
  
    try {
      const result = await request.save();
  
      this.logger.log(`Service request ID: ${id} assigned successfully to PM ${userId}`);
      return {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
    } catch (error) {
      this.logger.error(`Error assigning service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to assign service request');
    }
  }




  /**
   * Approve and publish a service request.
   */
  async approve(id: string, pmId: string, comment: string): Promise<any> {
    const request = await this.getServiceRequestById(id);
  
    if (request.providerManagerId !== pmId) {
      throw new ForbiddenException('You are not authorized to approve this service request');
    }
  
    request.status = 'published';
    request.notifications.push(`Approved and published by PM: ${pmId}. Comment: ${comment}`);
  
    try {
      const result = await request.save();
  
      this.logger.log(`Service request ID: ${id} approved and published successfully`);
      return {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
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
        ...request.toObject(),
      }));

      structuredRequests.forEach((req) => delete req._id);

      this.logger.log(`Fetched ${structuredRequests.length} published service requests`);
      return structuredRequests;
    } catch (error) {
      this.logger.error(`Error fetching published service requests: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch published service requests');
    }
  }

  // Edit drafts
  async editDraft(id: string, data: CreateServiceRequestDto, userId: string): Promise<any> {
    const request = await this.getServiceRequestById(id);
  
    if (request.createdBy !== userId) {
      throw new ForbiddenException('You are not authorized to edit this service request');
    }
  
    if (request.status !== 'draft') {
      throw new ForbiddenException('Only drafts can be edited');
    }
  
    Object.assign(request, data);
  
    try {
      const updatedRequest = await request.save();
  
      this.logger.log(`Draft service request ID: ${id} updated successfully`);
  
      const transformedResult = {
        ServiceRequestId: updatedRequest._id,
        ...updatedRequest.toObject(),
      };
      delete transformedResult._id;
  
      return transformedResult;
    } catch (error) {
      this.logger.error(`Error editing draft service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to edit draft service request');
    }
  }
  //Fetches all draft service requests for a particular user.
  async fetchDrafts(userId: string): Promise<any> {
    try {
      const drafts = await this.serviceRequestModel
        .find({ createdBy: userId, status: 'draft' })
        .exec();
  
      const structuredDrafts = drafts.map((request) => ({
        ServiceRequestId: request._id,
        ...request.toObject(),
      }));
      structuredDrafts.forEach((draft) => delete draft._id);
  
      this.logger.log(`Fetched ${structuredDrafts.length} drafts for user: ${userId}`);
      return structuredDrafts;
    } catch (error) {
      this.logger.error(`Error fetching drafts for user: ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch drafts');
    }
  }
  //Fetches all service requests assigned to a particular PM.
  async fetchAssigned(pmId: string): Promise<any> {
    try {
      const assignedRequests = await this.serviceRequestModel
        .find({ providerManagerId: pmId, status: 'assigned' })
        .exec();
  
      const structuredRequests = assignedRequests.map((request) => ({
        ServiceRequestId: request._id,
        ...request.toObject(),
      }));
      structuredRequests.forEach((req) => delete req._id);
  
      this.logger.log(`Fetched ${structuredRequests.length} assigned requests for PM: ${pmId}`);
      return structuredRequests;
    } catch (error) {
      this.logger.error(`Error fetching assigned requests for PM: ${pmId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch assigned requests');
    }
  }

  //1. Fetches all approved service requests by a particular PM.
  async fetchApproved(pmId: string): Promise<any> {
    try {
      const approvedRequests = await this.serviceRequestModel
        .find({ providerManagerId: pmId, status: 'published' })
        .exec();
  
      const structuredRequests = approvedRequests.map((request) => ({
        ServiceRequestId: request._id,
        ...request.toObject(),
      }));
      structuredRequests.forEach((req) => delete req._id);
  
      this.logger.log(`Fetched ${structuredRequests.length} approved requests by PM: ${pmId}`);
      return structuredRequests;
    } catch (error) {
      this.logger.error(`Error fetching approved requests by PM: ${pmId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch approved requests');
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
        const transformedRequest = {
          ServiceRequestId: request._id,
          ...request.toObject(),
        };
        delete transformedRequest._id;
        statusGroup.push(transformedRequest);
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

  //Reject a service request
  async reject(id: string, pmId: string, comment: string): Promise<any> {
    const request = await this.getServiceRequestById(id);
  
    // Ensure the logged-in PM is the one rejecting the request
    if (request.providerManagerId !== pmId) {
      throw new ForbiddenException('You are not authorized to reject this service request');
    }
  
    // Update the status and add a notification
    request.status = 'rejected';
    request.notifications.push(`Rejected by PM: ${pmId}. Comment: ${comment}`);
  
    try {
      const result = await request.save();
  
      this.logger.log(`Service request ID: ${id} rejected successfully`);
  
      // Transform the result to exclude internal fields
      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;
  
      return transformedResult;
    } catch (error) {
      this.logger.error(`Error rejecting service request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to reject service request');
    }
  }

  
}
