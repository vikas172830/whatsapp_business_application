import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getAuthDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getAuthDetails(id);
  }
}
