import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'The password of the user' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: "What's the name of your pet?",
    description: 'Security question for account recovery',
    enum: ["What's the name of your pet?", 'What is your favorite color?', 'What is your favorite food?'],
  })
  @IsString()
  @IsIn(["What's the name of your pet?", 'What is your favorite color?', 'What is your favorite food?'])
  securityQuestion: string;

  @ApiProperty({ example: 'Blue', description: 'Answer to the security question' })
  @IsString()
  securityAnswer: string;

  @ApiProperty({ example: 'user', description: 'Role of the user (default: user)' })
  @IsString()
  @IsIn(['user', 'admin', 'PM'])
  role: string;

  @ApiProperty({ example: 'MyCompany', description: 'Company name (optional)' })
  @IsString()
  companyName: string;
}
