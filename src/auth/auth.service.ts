import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/registerDto.dto';
import { Status } from 'src/enum/status.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ where: { email } });
    const userData = user?.dataValues;

    console.log('Checking the user data >>', userData);

    if (userData) {
      const check = await bcrypt.compare(password, userData.password);
    }

    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      throw new UnauthorizedException('Invalisd credentials');
    }
    const payload = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      phone_on: userData.phone_on,
      last_seen: userData.last_seen,
      about: userData.about,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const isUserExist = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (isUserExist) {
      throw new ConflictException('User is already exist!!!');
    }

    const hashedPass = await bcrypt.hash(registerDto.password, 15);

    const createUser = await this.userModel.create({
      phone_no: registerDto.phone_no,
      username: registerDto.username,
      about: registerDto.about,
      status: Status.OFFLINE,
      last_seen: registerDto.last_seen,
      email: registerDto.email,
      password: hashedPass,
      profile_picture: registerDto.profile_picture,
    });

    const payload = {
      sub: createUser.id,
      email: createUser.email,
      username: createUser.username,
      phone_no: createUser.phone_no,
      last_seen: createUser.last_seen,
      about: createUser.about,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
