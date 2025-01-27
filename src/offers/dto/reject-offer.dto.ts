import { IsString } from 'class-validator';

export class RejectOfferDto {
  @IsString()
  comment: string;
}