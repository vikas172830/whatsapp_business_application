import { IsString } from 'class-validator';

export class SendTextMsgDto {
  @IsString()
  to: string;

  @IsString()
  text_message: string;
}   