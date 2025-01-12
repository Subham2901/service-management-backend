import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ApproveServiceRequestDto {
  @ApiProperty({ example: 'Approving the request after review', description: 'Comment about the approval' })
  @IsString({ message: 'Comment must be a string' })
  @IsNotEmpty({ message: 'Comment is required' })
  @MinLength(3, { message: 'Comment must be at least 3 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment: string;
}
