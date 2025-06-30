import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class SendTemplateMessageDto {
  @IsString()
  to: string;

  @IsString()
  template_name: string;

  @IsArray()
  @IsOptional()
  body_params?: string[];

  @IsString()
  @IsOptional()
  header_type?: 'IMAGE' | 'DOCUMENT' | 'TEXT';

  @IsArray()
  @IsOptional()
  header_params?: string[];

  @IsString()
  @IsOptional()
  document_name?: string;

  @IsArray()
  @IsOptional()
  button_params?: string[];

  @IsBoolean()
  @IsOptional()
  stopFlow?: boolean;
}
