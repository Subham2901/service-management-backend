import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsEnum,
  ArrayNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 103, description: 'Master Agreement ID' })
  @IsNumber({}, { message: 'Agreement ID must be a number.' })
  @IsNotEmpty({ message: 'Agreement ID is required.' })
  agreementId: number;

  @ApiProperty({ example: 'Develop a feature', description: 'Task description' })
  @IsString({ message: 'Task description must be a string.' })
  @IsNotEmpty({ message: 'Task description is required.' })
  taskDescription: string;

  @ApiProperty({ example: 'Team', description: 'Type of service request (Single, Multi, Team)' })
  @IsEnum(['Single', 'Multi', 'Team'], { message: 'Type must be one of Single, Multi, or Team.' })
  @IsNotEmpty({ message: 'Type is required.' })
  type: string;

  @ApiProperty({ example: 'Project Alpha', description: 'Project name' })
  @IsString({ message: 'Project name must be a string.' })
  @IsNotEmpty({ message: 'Project name is required.' })
  project: string;

  @ApiProperty({
    example: [
      {
        domainId: 1,
        domainName: 'IT Security',
        roleId: 101,
        role: 'Administrator',
        level: 'Junior',
        technologyLevel: 'Common',
        numberOfProfilesNeeded: 2,
      },
    ],
    description: 'Selected members for the service request',
  })
  @IsArray({ message: 'Selected members must be an array.' })
  @ArrayNotEmpty({ message: 'Selected members must not be empty.' })
  selectedMembers: {
    domainId: number;
    domainName: string;
    roleId: number;
    role: string;
    level: string;
    technologyLevel: string;
    numberOfProfilesNeeded: number;
  }[];

  @ApiProperty({ example: '2025-01-01', description: 'Start date of the project' })
  @IsDateString({}, { message: 'Begin date must be a valid ISO 8601 date string.' })
  @IsNotEmpty({ message: 'Begin date is required.' })
  begin: Date;

  @ApiProperty({ example: '2025-02-01', description: 'End date of the project' })
  @IsDateString({}, { message: 'End date must be a valid ISO 8601 date string.' })
  @IsNotEmpty({ message: 'End date is required.' })
  end: Date;

  @ApiProperty({ example: 20, description: 'Total man-days required' })
  @IsNumber({}, { message: 'Amount of man-days must be a number.' })
  @IsNotEmpty({ message: 'Amount of man-days is required.' })
  amountOfManDays: number;

  @ApiProperty({ example: 'Remote', description: 'Work location' })
  @IsString({ message: 'Location must be a string.' })
  @IsNotEmpty({ message: 'Location is required.' })
  location: string;

  @ApiProperty({ example: ['Representative1', 'Representative2'], description: 'List of representatives' })
  @IsArray({ message: 'Representatives must be an array.' })
  @ArrayNotEmpty({ message: 'Representatives must not be empty.' })
  representatives: string[];

  @ApiProperty({ example: 'Onsite', description: 'Location type (e.g., Nearshore, Farshore, Offshore)' })
  @IsString({ message: 'Location type must be a string.' })
  @IsNotEmpty({ message: 'Location type is required.' })
  locationType: string;

  @ApiProperty({ example: 'Additional notes for PM', description: 'Optional information for PM' })
  @IsString({ message: 'Information for provider manager must be a string.' })
  @IsOptional()
  informationForProviderManager?: string;

  @ApiProperty({ example: 5, description: 'Number of Specialist to expect', required: false })
  @IsNumber({}, { message: 'Number of Specialist must be a number.' })
  @IsOptional()
  numberOfSpecialists?: number;

  @ApiProperty({ example: 5, description: 'Number of offers to expect', required: false })
  @IsNumber({}, { message: 'Number of offers must be a number.' })
  @IsOptional()
  numberOfOffers?: number;

  @ApiProperty({ example: 'Consumer Company', description: 'Consumer name', required: false })
  @IsString({ message: 'Consumer must be a string.' })
  @IsOptional()
  consumer?: string;
}
