import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
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
  
      // Handle specific error scenarios
      if (error instanceof BadRequestException) {
        throw error; // Pass existing BadRequestException directly
      }
  
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new BadRequestException('Email already exists');
      }
  
      // Fallback for unknown errors
      throw new BadRequestException('Registration failed due to an unknown error');
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
  async getProfile(userId: string) {
    this.logger.log(`Fetching profile for user ID: ${userId}`);
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Return only necessary fields
      const { password, ...profile } = user.toObject();
      this.logger.log(`Profile fetched successfully for user ID: ${userId}`);
      return profile;
    } catch (error) {
      this.logger.error(`Error fetching profile for user ID: ${userId}`, error.stack);
      throw new NotFoundException('Could not fetch profile');
    }
  }
}
