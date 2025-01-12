import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() user: CreateUserDto) {
    this.logger.log('Register endpoint called');
    this.logger.debug(`Registration request body: ${JSON.stringify(user)}`);
    const result = await this.authService.register(user);
    this.logger.log('User registration successful');
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() user: LoginUserDto) {
    this.logger.log('Login endpoint called');
    this.logger.debug(`Login request body: ${JSON.stringify(user)}`);
    const result = await this.authService.login(user);
    this.logger.log('User login successful');
    return result;
  }
}
