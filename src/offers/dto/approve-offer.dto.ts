// dto/approve-offer.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ApproveOfferDto {
  @IsOptional()
  @IsString()
  comment?: string;
}