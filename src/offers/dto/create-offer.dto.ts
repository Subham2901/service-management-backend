import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'ServiceRequestID123', description: 'Service Request ID' })
  @IsString()
  @IsNotEmpty()
  serviceRequestId: string;

  @ApiProperty({ example: 1005, description: 'Provider ID' })
  @IsNumber()
  @IsNotEmpty()
  providerId: number;

  @ApiProperty({ example: 'Michael Schmidt', description: 'Provider Name' })
  @IsString()
  @IsNotEmpty()
  providerName: string;

  @ApiProperty({ example: 'Security Engineer', description: 'Role' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Junior', description: 'Level' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiProperty({ example: 'Common', description: 'Technology Level' })
  @IsString()
  @IsNotEmpty()
  technologyLevel: string;

  @ApiProperty({ example: 700, description: 'Price per profile' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: [{ employeeID: 'E123', price: 700 }],
    description: 'Generated profiles for the offer',
  })
  @IsArray()
  employeeProfiles: {
    employeeID: string;
    price: number;
  }[];
}
