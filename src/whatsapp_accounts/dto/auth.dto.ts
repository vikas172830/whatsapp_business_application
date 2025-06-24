import { IsString } from 'class-validator';

export class whatsappDto {
  @IsString()
  phone_number_id: string;

  @IsString()
  waba_id: string;

  @IsString()
  business_id: string;

  @IsString()
  access_token: string;
}
