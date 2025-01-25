import { Controller, Get, Param, Patch, Body, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { first } from 'rxjs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
@ApiOperation({ summary: 'Fetch all users or search users with filters' })
@ApiQuery({ name: 'role', required: false, type: String })
@ApiQuery({ name: 'firstName', required: false, type: String })
@ApiQuery({ name: 'lastName', required: false, type: String })
@ApiQuery({ name: 'company', required: false, type: String })
async findAll(
  @Query('role') role?: string,
  @Query('firstName') firstName?: string,
  @Query('lastName') lastName?: string,
  @Query('company') company?: string,
) {
  if (role || firstName || lastName || company) {
    return this.usersService.findWithFilters(role, firstName, lastName, company);
  }
  return this.usersService.findAll();
}




  @Get(':id')
  @ApiOperation({ summary: 'Fetch a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID to fetch' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID to update' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(id, updateData);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password by security question' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        securityAnswer: { type: 'string', example: 'My first pet' },
        newPassword: { type: 'string', example: 'newSecurePassword123' },
      },
    },
  })
  async resetPassword(@Body() body: { email: string; securityAnswer: string; newPassword: string }) {
    const { email, securityAnswer, newPassword } = body;
    return this.usersService.resetPassword(email, securityAnswer, newPassword);
  }
}
