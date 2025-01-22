
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(userData: any): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: userData.email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateData: any): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async resetPassword(email: string, securityAnswer: string, newPassword: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAnswerValid = securityAnswer.toLowerCase() === user.securityAnswer.toLowerCase();
    if (!isAnswerValid) {
      throw new BadRequestException('Invalid security answer');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return 'Password reset successful';
  }
}
