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

  /**
   * Fetch and store agreement details, grouped by domain.
   */
  async fetchAndStoreAgreementDetails(agreementId: number): Promise<any> {
    this.logger.debug(`Fetching details for Master Agreement ID: ${agreementId}`);
    const rawDetails = await this.masterAgreementDetailModel.find({ agreementId }).exec();

    if (!rawDetails.length) {
      this.logger.warn(`No details found for agreement ID: ${agreementId}`);
      throw new NotFoundException('No details found for the specified agreement ID');
    }

    const groupedDetails = rawDetails.reduce((acc, detail) => {
      const { domainId, domainName, providerId, providerName, role, level, technologyLevel, price, cycle } = detail;

      let domainGroup = acc.find((group) => group.domainId === domainId);
      if (!domainGroup) {
        domainGroup = { domainId, domainName, roleDetails: [] };
        acc.push(domainGroup);
      }

      domainGroup.roleDetails.push({
        providerId,
        providerName,
        role,
        level,
        technologyLevel,
        price,
        cycle,
      });

      return acc;
    }, []);

    this.logger.log(`Grouped ${groupedDetails.length} domains for agreement ID: ${agreementId}`);
    return groupedDetails;
  }
}
