import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MasterAgreement } from './schemas/master-agreement.schema';
import { MasterAgreementDetail } from './schemas/master-agreement-detail.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MasterAgreementsService {
  private readonly logger = new Logger(MasterAgreementsService.name);
  private readonly baseUrl = 'https://agiledev-contractandprovidermana-production.up.railway.app/master-agreements';

  constructor(
    @InjectModel(MasterAgreement.name) private readonly masterAgreementModel: Model<MasterAgreement>,
    @InjectModel(MasterAgreementDetail.name) private readonly masterAgreementDetailModel: Model<MasterAgreementDetail>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Fetch and store all master agreements.
   */
  async fetchAndStoreMasterAgreements(): Promise<MasterAgreement[]> {
    const url = `${this.baseUrl}/established-agreements`;
    this.logger.log(`Fetching master agreements from ${url}`);
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const agreements = response.data;

      const promises = agreements.map((agreement) =>
        this.masterAgreementModel.updateOne(
          { agreementId: agreement.agreementId },
          agreement,
          { upsert: true },
        ),
      );
      await Promise.all(promises);

      this.logger.log(`Fetched and stored ${agreements.length} master agreements`);
      return this.masterAgreementModel.find().exec();
    } catch (error) {
      this.logger.error(`Error fetching master agreements: ${error.message}`, error.stack);
      throw new HttpException('Failed to fetch master agreements', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async fetchAndStoreAgreementDetails(agreementId: number): Promise<any> {
    this.logger.debug(`Fetching details for Master Agreement ID: ${agreementId}`);
  
    // Step 1: Fetch details from the database
    let rawDetails = await this.masterAgreementDetailModel.find({ agreementId }).exec();
  
    // Step 2: If no data in DB, fetch from external API
    if (!rawDetails.length) {
      this.logger.warn(`No details found in the database for agreement ID: ${agreementId}`);
      const url = `${this.baseUrl}/established-agreements/${agreementId}`;
      this.logger.log(`Fetching details from external API: ${url}`);
      
      try {
        const response = await firstValueFrom(this.httpService.get(url));
        const externalDetails = response.data;
  
        // Normalize and validate external API data
        const validDetails = externalDetails.flatMap((domain) =>
          domain.roleDetails.map((roleDetail) => ({
            agreementId,
            domainId: domain.domainId,
            domainName: domain.domainName,
            ...roleDetail,
          }))
        );
  
        if (!validDetails.length) {
          this.logger.warn(`No valid details found from the external API for agreement ID: ${agreementId}`);
          throw new NotFoundException('No valid details found for the specified agreement ID');
        }
  
        // Step 3: Save valid details to the database
        await this.masterAgreementDetailModel.insertMany(validDetails, { ordered: false });
        this.logger.log(`Stored ${validDetails.length} details for agreement ID: ${agreementId}`);
  
        rawDetails = validDetails;
      } catch (error) {
        this.logger.error(`Error fetching details from external API: ${error.message}`, error.stack);
        throw new NotFoundException('Failed to fetch agreement details from external API');
      }
    }
  
    // Step 4: Normalize raw data from DB or external API
    const normalizedDetails = rawDetails.map((detail) =>
      detail.toObject ? detail.toObject() : detail
    );
  
    // Step 5: Group and process details by domain
    const groupedDetails = normalizedDetails.reduce((acc, detail) => {
      const { domainId, domainName, ...roleDetail } = detail;
  
      let domainGroup = acc.find((group) => group.domainId === domainId);
      if (!domainGroup) {
        domainGroup = { domainId, domainName, roleDetails: [] };
        acc.push(domainGroup);
      }
  
      domainGroup.roleDetails.push(roleDetail);
      return acc;
    }, []);
  
    this.logger.log(`Grouped ${groupedDetails.length} domains for agreement ID: ${agreementId}`);
    return groupedDetails;
  }
  


}
