import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerDto.dto';
import { GetUserDetailsDto } from './dto/getUserDetails.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // login(@Body() loginDto: Record<string, any>) {
  //   return this.authService.login(loginDto.email, loginDto.password);
  // }

  // @Post('register')
  // register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }

  @Post('getUserDetails')
  getUserDetails(@Body() getUserDetailsDto: GetUserDetailsDto) {
    return this.authService.getUserDetails(getUserDetailsDto);
  }
}
