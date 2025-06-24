import { Injectable, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async getAuthDetails(id: number) {
    return await this.userModel.findByPk(id);
  }
}
