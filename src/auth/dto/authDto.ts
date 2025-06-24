import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Status } from 'src/enum/status.enum';

export class AuthDto {
  @IsNumber()
  phone_no: number;

  @IsString()
  username: string;

  @IsString()
  about: string;

  @IsEnum(Status)
  status: Status;

  @IsString()
  last_seen: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  profile_picture: string;
}
