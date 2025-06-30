import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class GetUserDetailsDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsNumber()
  @IsNotEmpty()
  tenantId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
} 