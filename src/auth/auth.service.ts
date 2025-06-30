import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/registerDto.dto';
import { GetUserDetailsDto } from './dto/getUserDetails.dto';
import { Status } from 'src/enum/status.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  // async login(
  //   email: string,
  //   password: string,
  // ): Promise<{ access_token: string }> {
  //   const user = await this.userModel.findOne({ where: { email } });
  //   const userData = user?.dataValues;

  //   console.log('Checking the user data >>', userData);

  //   if (userData) {
  //     const check = await bcrypt.compare(password, userData.password);
  //   }

  //   if (!userData || !(await bcrypt.compare(password, userData.password))) {
  //     throw new UnauthorizedException('Invalisd credentials');
  //   }
  //   const payload = {
  //     id: userData.id,
  //     email: userData.email,
  //     username: userData.username,
  //     phone_on: userData.phone_on,
  //     last_seen: userData.last_seen,
  //     about: userData.about,
  //   };

  //   return {
  //     access_token: await this.jwtService.signAsync(payload),
  //   };
  // }

  // async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
  //   const isUserExist = await this.userModel.findOne({
  //     where: { email: registerDto.email },
  //   });

  //   if (isUserExist) {
  //     throw new ConflictException('User is already exist!!!');
  //   }

  //   const hashedPass = await bcrypt.hash(registerDto.password, 15);

  //   const createUser = await this.userModel.create({
  //     phone_no: registerDto.phone_no,
  //     username: registerDto.username,
  //     about: registerDto.about,
  //     status: Status.OFFLINE,
  //     last_seen: registerDto.last_seen,
  //     email: registerDto.email,
  //     password: hashedPass,
  //     profile_picture: registerDto.profile_picture,
  //   });

  //   const payload = {
  //     sub: createUser.id,
  //     email: createUser.email,
  //     username: createUser.username,
  //     phone_no: createUser.phone_no,
  //     last_seen: createUser.last_seen,
  //     about: createUser.about,
  //   };

  //   return {
  //     access_token: await this.jwtService.signAsync(payload),
  //   };
  // }

  async getUserDetails(getUserDetailsDto: GetUserDetailsDto) {
    try {
      // Verify the access token
      const payload = await this.jwtService.verifyAsync(getUserDetailsDto.accessToken);
      
      if (!payload) {
        throw new UnauthorizedException('Invalid access token');
      }

      // Find user by ID and validate tenant access
      const user = await this.userModel.findByPk(getUserDetailsDto.userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // For now, we'll return user details without tenant validation
      // You can add tenant validation logic here based on your requirements
      const userData = user.dataValues;
      
      // Remove sensitive information
      const { password, ...userDetails } = userData;
      
      return {
        success: true,
        data: userDetails,
        message: 'User details retrieved successfully'
      };
      
    } catch (error) {
      if (error instanceof UnauthorizedException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired access token');
      }
      
      throw new ForbiddenException('Access denied');
    }
  }
}
