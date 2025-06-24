import { Status } from 'src/enum/status.enum';

export class RegisterDto {
  phone_no: number;
  username: string;
  about: string;
  status: Status;
  last_seen: string;
  email: string;
  password: string;
  profile_picture: string;
}
