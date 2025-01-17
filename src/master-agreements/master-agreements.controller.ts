/* import { Controller, Get, Param, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MasterAgreementsService } from './master-agreements.service';

@ApiTags('Master Agreements')
@Controller('master-agreements')
export class MasterAgreementsController {
  private readonly logger = new Logger(MasterAgreementsController.name);

  constructor(private readonly masterAgreementsService: MasterAgreementsService) {}

  @Get('/fetch-and-store')
  @ApiOperation({ summary: 'Fetch and store all master agreements' })
  async fetchAndStoreMasterAgreements() {
    this.logger.log('Fetching all master agreements');
    try {
      const agreements = await this.masterAgreementsService.fetchAndStoreMasterAgreements();
      this.logger.log(`Fetched and stored ${agreements.length} master agreements`);
      return agreements;
    } catch (error) {
      this.logger.error('Error fetching master agreements', error.stack);
      throw error;
    }
  }

  @Get('/:id/fetch-and-store-details')
  @ApiOperation({ summary: 'Fetch and store details of a specific master agreement' })
  @ApiParam({ name: 'id', description: 'ID of the master agreement to fetch details for', example: 103 })
  async fetchAndStoreAgreementDetails(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching and grouping details for Master Agreement ID: ${id}`);
    try {
      const result = await this.masterAgreementsService.fetchAndStoreAgreementDetails(id);
      this.logger.log(`Successfully fetched and grouped details for Master Agreement ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching details for Master Agreement ID: ${id}`, error.stack);
      throw error;
    }
  }
}
 */
// New MASTER AGREEMENTS CONTROLLER

/* import { Controller, Get, Param, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MasterAgreementsService } from './master-agreements.service';

@ApiTags('Master Agreements')
@Controller('master-agreements')
export class MasterAgreementsController {
  private readonly logger = new Logger(MasterAgreementsController.name);

  constructor(private readonly masterAgreementsService: MasterAgreementsService) {}

  @Get('/fetch-and-store')
  @ApiOperation({ summary: 'Fetch and store all master agreements' })
  async fetchAndStoreMasterAgreements() {
    this.logger.log('Fetching all master agreements');
    return this.masterAgreementsService.fetchAndStoreMasterAgreements();
  }

  @Get('/:id/fetch-and-store-details')
  @ApiOperation({ summary: 'Fetch and store details of a specific master agreement' })
  @ApiParam({ name: 'id', description: 'ID of the master agreement to fetch details for', example: 103 })
  async fetchAndStoreAgreementDetails(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching details for Master Agreement ID: ${id}`);
    return this.masterAgreementsService.fetchAndStoreAgreementDetails(id);
  }
}
 */
import { Controller, Get, Param, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MasterAgreementsService } from './master-agreements.service';

@ApiTags('Master Agreements')
@Controller('master-agreements')
export class MasterAgreementsController {
  private readonly logger = new Logger(MasterAgreementsController.name);

  constructor(private readonly masterAgreementsService: MasterAgreementsService) {}

  @Get('/fetch-and-store')
  @ApiOperation({ summary: 'Fetch and store all master agreements' })
  async fetchAndStoreMasterAgreements() {
    this.logger.log('Fetching all master agreements');
    return this.masterAgreementsService.fetchAndStoreMasterAgreements();
  }

  @Get('/:id/fetch-and-store-details')
  @ApiOperation({ summary: 'Fetch and store details of a specific master agreement' })
  @ApiParam({ name: 'id', description: 'ID of the master agreement to fetch details for', example: 103 })
  async fetchAndStoreAgreementDetails(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching details for Master Agreement ID: ${id}`);
    return this.masterAgreementsService.fetchAndStoreAgreementDetails(id);
  }

  @Get('/manual-sync')
  @ApiOperation({ summary: 'Manually sync all master agreements and details' })
  async manualSync() {
    this.logger.log('Manually syncing all master agreements and details');
    return this.masterAgreementsService.fetchAndStoreAll();
  }
}
