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
        cycleStatus: 'cycle_one',
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
  
    try {
      const result = await request.save();
  
      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;
  
      this.logger.log(`Service request ID: ${id} assigned successfully to PM ${userId}`);
      return transformedResult;
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

      const transformedResult = {
        ServiceRequestId: result._id,
        ...result.toObject(),
      };
      delete transformedResult._id;

      return transformedResult;
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
}
