/* import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsNotEmpty, IsEnum, MinLength, MaxLength, ArrayNotEmpty } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 103, description: 'Master Agreement ID' })
  @IsNumber()
  @IsNotEmpty()
  agreementId: number;

  @ApiProperty({ example: 'Master Agreement B', description: 'Master Agreement Name' })
  @IsString()
  @IsNotEmpty()
  agreementName: string;

  @ApiProperty({ example: 'Develop a feature', description: 'Task description' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  @IsNotEmpty()
  taskDescription: string;

  @ApiProperty({ example: 'Team', description: 'Type of service request (Single, Multi, Team)' })
  @IsEnum(['Single', 'Multi', 'Team'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Project Alpha', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  project: string;

  @ApiProperty({ example: '2025-02-01', description: 'Start date' })
  @IsString()
  @IsNotEmpty()
  begin: string;

  @ApiProperty({ example: '2025-02-28', description: 'End date' })
  @IsString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({ example: 20, description: 'Total man-days required' })
  @IsNumber()
  @IsNotEmpty()
  amountOfManDays: number;

  @ApiProperty({ example: 'Onsite', description: 'Location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: [1, 2], description: 'Selected Domain IDs (multiple for Team)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  selectedDomains: number[];

  @ApiProperty({
    example: [
      {
        providerId: 101,
        domainId: 1,
        role: 'Administrator',
        level: 'Junior',
        technology: 'Common',
        providerName: 'Provider A',
      },
    ],
    description: 'Selected members for the service request',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty()
  selectedMembers: {
    providerId: number;
    domainId: number;
    role: string;
    level: string;
    technology: string;
    providerName: string;
  }[];
}
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsNotEmpty, IsEnum, MinLength, MaxLength, ArrayNotEmpty,IsOptional } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 103, description: 'Master Agreement ID' })
  @IsNumber()
  @IsNotEmpty()
  agreementId: number;

  @ApiProperty({ example: 'Master Agreement B', description: 'Master Agreement Name' })
  @IsString()
  @IsNotEmpty()
  agreementName: string;

  @ApiProperty({ example: 'Develop a feature', description: 'Task description' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  @IsNotEmpty()
  taskDescription: string;

  @ApiProperty({ example: 'Team', description: 'Type of service request (Single, Multi, Team)' })
  @IsEnum(['Single', 'Multi', 'Team'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Project Alpha', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  project: string;

  @ApiProperty({ example: '2025-02-01', description: 'Start date' })
  @IsString()
  @IsNotEmpty()
  begin: string;

  @ApiProperty({ example: '2025-02-28', description: 'End date' })
  @IsString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({ example: 20, description: 'Total man-days required' })
  @IsNumber()
  @IsNotEmpty()
  amountOfManDays: number;

  @ApiProperty({ example: 'Onsite', description: 'Location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Additional info for the provider manager', description: 'Information for the provider manager' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  informationForProviderManager?: string;

  @ApiProperty({ example: 3, description: 'Number of specialists required' })
  @IsNumber()
  @IsNotEmpty()
  numberOfSpecialists: number;

  @ApiProperty({ example: 2, description: 'Number of offers from each provider wanted' })
  @IsNumber()
  @IsNotEmpty()
  numberOfOffers: number;

  @ApiProperty({ example: 'John Doe', description: 'Consumer name' })
  @IsString()
  @IsNotEmpty()
  consumer: string;

  @ApiProperty({ example: ['Jane Doe', 'Jack Smith'], description: 'Representatives for the service request' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  representatives: string[];

  @ApiProperty({ example: [1, 2], description: 'Selected Domain IDs (multiple for Team)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  selectedDomains: number[];

  @ApiProperty({
    example: [
      {
        domainId: 1,
        domainName: 'IT Security',
        role: 'Administrator',
        level: 'Junior',
        technologyLevel: 'Common',
      },
    ],
    description: 'Selected members for the service request',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty()
  selectedMembers: {
    domainId: number;
    domainName: string;
    role: string;
    level: string;
    technologyLevel: string;
  }[];

  @ApiProperty({ example: 'Onshore', description: 'Location type' })
  @IsEnum(['Onshore', 'Nearshore', 'Farshore'])
  @IsNotEmpty()
  locationType: string;

  @ApiProperty({ example: 'Uploaded project description', description: 'Document link or data for further descriptions' })
  @IsString()
  @IsOptional()
  document?: string;
}
