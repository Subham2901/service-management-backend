import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './offer.schema';
import { ApproveOfferDto } from './dto/approve-offer.dto';
import { RejectOfferDto } from './dto/reject-offer.dto';
import { ServiceRequest } from '../service-requests/schemas/service-request.schema'; // Import ServiceRequest schema

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequest>, // Add this line
  ) {}

  private readonly logger = new Logger(OffersService.name);

  private getMasterAgreementDetails() {
    return [
      {
        agreementId: 123,
        name: 'Master Agreement A',
        domains: [
          {
            domainId: 1,
            domainName: 'IT Security',
            roleDetails: [
              {
                providerId: 1006,
                providerName: 'jonasbecker',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1007,
                providerName: 'lukasfischer',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle1',
              },
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle1',
              },
              {
                providerId: 1008,
                providerName: 'leonwagner',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle2',
              },
            ],
          },
        ],
      },
      {
        agreementId: 124,
        name: 'Master Agreement B',
        domains: [
          {
            domainId: 1,
            domainName: 'IT Security',
            roleDetails: [
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle1',
              },
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Security Engineer',
                level: 'Intermediate',
                technologyLevel: 'Common',
                price: '900.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Security Engineer',
                level: 'Senior',
                technologyLevel: 'Common',
                price: '1000.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1006,
                providerName: 'jonasbecker',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1006,
                providerName: 'jonasbecker',
                role: 'Security Engineer',
                level: 'Intermediate',
                technologyLevel: 'Common',
                price: '900.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1006,
                providerName: 'jonasbecker',
                role: 'Security Engineer',
                level: 'Senior',
                technologyLevel: 'Common',
                price: '1000.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1007,
                providerName: 'lukasfischer',
                role: 'Security Engineer',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle2',
              },
            ],
          },
        ],
      },
      {
        agreementId: 125,
        name: 'Master Agreement C',
        domains: [
          {
            domainId: 1,
            domainName: 'IT Security',
            roleDetails: [
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Information Security Management Systems (ISMS) Manager',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '800.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Information Security Management Systems (ISMS) Manager',
                level: 'Intermediate',
                technologyLevel: 'Common',
                price: '900.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Information Security Management Systems (ISMS) Manager',
                level: 'Senior',
                technologyLevel: 'Common',
                price: '1000.00',
                cycle: 'Cycle1',
              },
            ],
          },
          {
            domainId: 2,
            domainName: 'Data',
            roleDetails: [
              {
                providerId: 1005,
                providerName: 'michaelschmidt',
                role: 'Data Analyst',
                level: 'Junior',
                technologyLevel: 'Common',
                price: '1000.00',
                cycle: 'Cycle2',
              },
              {
                providerId: 1006,
                providerName: 'jonasbecker',
                role: 'Data Analyst',
                level: 'Intermediate',
                technologyLevel: 'Common',
                price: '1100.00',
                cycle: 'Cycle2',
              },
            ],
          },
        ],
      },
    ];
  }
  
  
  async generateOffers(serviceRequest: any) {
    const { selectedMembers, cycleStatus, agreementId, id: serviceRequestId } = serviceRequest;
  
    const agreements = this.getMasterAgreementDetails();
    const agreement = agreements.find((a) => a.agreementId === agreementId);
    if (!agreement) {
      throw new NotFoundException(`Master agreement with ID ${agreementId} not found.`);
    }
  
    // Delete existing offers for this service request that belong to a different cycle
    await this.offerModel.deleteMany({ serviceRequestId, cycle: { $ne: cycleStatus } }).exec();
    this.logger.log(`Deleted previous offers for ServiceRequest: ${serviceRequestId} in cycles other than ${cycleStatus}`);
  
    // Check if offers already exist for the current cycleStatus
    const existingOffersForCycle = await this.offerModel
      .find({ serviceRequestId, cycle: cycleStatus })
      .exec();
  
    if (existingOffersForCycle.length > 0) {
      this.logger.warn(`Offers already generated for ServiceRequest: ${serviceRequestId} in cycle ${cycleStatus}`);
      return { message: `Offers already exist for cycle ${cycleStatus}`, offers: existingOffersForCycle };
    }
  
    const offers = [];
  
    selectedMembers.forEach((member) => {
      const domain = agreement.domains.find((d) => d.domainId === member.domainId);
      if (!domain) {
        this.logger.warn(`Domain ID ${member.domainId} not found in agreement ${agreementId}`);
        offers.push({
          serviceRequestId,
          domainId: member.domainId,
          domainName: null,
          role: member.role,
          level: member.level,
          technologyLevel: member.technologyLevel,
          providerId: null,
          providerName: null,
          price: null,
          cycle: cycleStatus,
          employeeProfiles: [],
          status: 'No Offers',
          comments: `No domain found for Domain ID ${member.domainId}`,
        });
        return;
      }
  
      const matchingRoles = domain.roleDetails.filter(
        (role) =>
          role.role === member.role &&
          role.level === member.level &&
          role.technologyLevel === member.technologyLevel &&
          role.cycle === cycleStatus,
      );
  
      if (matchingRoles.length === 0) {
        offers.push({
          serviceRequestId,
          domainId: member.domainId,
          domainName: domain.domainName,
          role: member.role,
          level: member.level,
          technologyLevel: member.technologyLevel,
          providerId: null,
          providerName: null,
          price: null,
          cycle: cycleStatus,
          employeeProfiles: [],
          status: 'No Offers',
          comments: `No matching roles found for ${member.role} in cycle ${cycleStatus}`,
        });
        return;
      }
  
      matchingRoles.forEach((role) => {
        const profiles = [];
        const discountedPrice = this.getRandomPriceBelowMax(role.price);
  
        for (let i = 0; i < member.numberOfProfilesNeeded; i++) {
          const employeeName = this.getRandomEmployeeName();
          profiles.push({
            employeeID: `${role.providerId}-${i + 1}`,
            employeeName,
          });
        }
  
        offers.push({
          serviceRequestId,
          domainId: member.domainId,
          domainName: domain.domainName,
          role: member.role,
          level: member.level,
          technologyLevel: role.technologyLevel,
          providerId: role.providerId,
          providerName: role.providerName,
          price: discountedPrice.toFixed(2),
          cycle: role.cycle,
          employeeProfiles: profiles,
          status: 'Pending',
          comments: null,
        });
      });
    });
  
    if (offers.length === 0) {
      return {
        message: `No offers available for any selected members in cycle ${cycleStatus}`,
        offers: [],
      };
    }
  
    // Save new offers to the database
    await this.offerModel.insertMany(offers);
  
    return {
      message: 'Offers generated successfully',
      offers,
    };
  }
  
  
  // Utility function to generate random employee names
  private getRandomEmployeeName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Chris', 'Anna'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Lee', 'Walker', 'Hall'];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${randomFirstName} ${randomLastName}`;
  }
  
  private getRandomPriceBelowMax(maxPrice: string): number {
    const max = parseFloat(maxPrice);
    const discountPercentage = Math.random() * 0.2; // Random discount between 0% and 20%
    return parseFloat((max * (1 - discountPercentage)).toFixed(2));
  }
  

  

  async selectOffer(offerId: string) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found.`);
    }
  
    if (offer.status !== 'Pending') {
      throw new BadRequestException('Only pending offers can be selected.');
    }
  
    offer.status = 'Selected';
    await offer.save();
  
    // Check and update the service request status
    const serviceRequest = await this.serviceRequestModel.findById(offer.serviceRequestId);
    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID ${offer.serviceRequestId} not found.`);
    }
  
  
    return {
      message: 'Offer selected successfully',
      offer,
    };
  }
  async getSelectedOffers(serviceRequestId: string) {
    return await this.offerModel.find({ serviceRequestId, status: 'Selected' }).exec();
  }

  async getOffersByServiceRequestId(serviceRequestId: string) {
    // Fetch offers from the database where `serviceRequestId` matches
    const offers = await this.offerModel.find({ serviceRequestId }).exec();
    return offers;
  }
  async evaluateOffer(offerId: string, status: 'Approved' | 'Rejected', comment?: string) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) throw new NotFoundException(`Offer with ID ${offerId} not found.`);
  
    offer.status = status;
    if (comment) offer.comments = comment;
    return await offer.save();
  }
  
}
