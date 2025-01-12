import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Add a logger

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(user: any) {
    this.logger.log('Starting user registration process');
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const userData = { ...user, password: hashedPassword };

      this.logger.debug(`Registering user with data: ${JSON.stringify(userData)}`);
      const result = await this.usersService.create(userData);
      this.logger.log(`User registered successfully with ID: ${result._id}`);
      return result;
    } catch (error) {
      this.logger.error('Error during user registration', error.stack);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(user: { email: string; password: string }) {
    this.logger.log('Starting user login process');
    try {
      const existingUser = await this.usersService.findByEmail(user.email);
      if (!existingUser) {
        this.logger.error(`Login failed: User with email ${user.email} not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordValid = await bcrypt.compare(user.password, existingUser.password);
      if (!passwordValid) {
        this.logger.error(`Login failed: Incorrect password for email ${user.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: existingUser.email, role: existingUser.role, id: existingUser._id };
      this.logger.debug(`Generating JWT for user with payload: ${JSON.stringify(payload)}`);

      const token = this.jwtService.sign(payload);
      this.logger.log(`User logged in successfully with email: ${user.email}`);
      return { access_token: token };
    } catch (error) {
      this.logger.error('Error during user login', error.stack);
      throw error;
    }
  }
}
