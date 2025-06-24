import { IsNumber, IsString } from 'class-validator';

export class SubscribeDto {
  @IsNumber()
  id: number;

  @IsString()
  waba_id: string;

  @IsString()
  business_token: string;
}
