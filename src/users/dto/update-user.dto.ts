import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'securePassword123', description: 'The new password of the user' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'John', description: 'The updated first name of the user' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'The updated last name of the user' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: "What's the name of your pet?",
    description: 'The new security question',
    enum: ["What's the name of your pet?", 'What is your favorite color?', 'What is your favorite food?'],
  })
  @IsString()
  @IsIn(["What's the name of your pet?", 'What is your favorite color?', 'What is your favorite food?'])
  @IsOptional()
  securityQuestion?: string;

  @ApiPropertyOptional({ example: 'Blue', description: 'The updated answer to the security question' })
  @IsString()
  @IsOptional()
  securityAnswer?: string;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'The new role of the user',
    enum: ['admin', 'PM', 'user'],
  })
  @IsString()
  @IsIn(['admin', 'PM', 'user'])
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: 'UpdatedCompany', description: 'The updated company name' })
  @IsString()
  @IsOptional()
  companyName?: string;
}
