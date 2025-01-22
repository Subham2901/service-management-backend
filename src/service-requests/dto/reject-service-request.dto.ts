
// New REJECT SERVICE REQUEST DTO
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RejectServiceRequestDto {
  @ApiProperty({ example: 'Rejecting due to insufficient details', description: 'Comment about the rejection' })
  @IsString({ message: 'Comment must be a string' })
  @IsNotEmpty({ message: 'Comment is required' })
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment: string;
}
