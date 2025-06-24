import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class PhoneDto {
  @IsNotEmpty()
  @IsNumberString()
  id: string;

  @IsOptional()
  cc: string;

  @IsOptional()
  country_dial_code: string;

  @IsOptional()
  display_phone_number: string;

  @IsOptional()
  verified_name: string;

  @IsOptional()
  quality_rating: string;

  @IsOptional()
  search_visibility: string;

  @IsOptional()
  status: string;

  @IsOptional()
  platform_type: string;

  @IsOptional()
  code_verification_status: string;
}
