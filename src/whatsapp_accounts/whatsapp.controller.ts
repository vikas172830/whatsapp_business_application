import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  ParseIntPipe,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import axios from 'axios';
import { PhoneDto } from './dto/phone_details.dto';
import { SendTemplateMessageDto } from './dto/sentTamplateMessage.dto';
import { SendTextMsgDto } from './dto/sendTextMsg.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Post('facebook')
  async accept_code(@Body('code') code: string, @Req() req: Request) {
    return await this.whatsappService.accept_code(code, req);
  }

  @Get('all')
  get_Users() {
    return this.whatsappService.getUsers();
  }

  @Post('subscribe')
  async subscribe(@Body() body: any, @Res() res: Response) {
    const { id, business_token, waba_id } = body;

    console.log('business_token: ', business_token);
    console.log('waba_id: ', waba_id);
    console.log(`User ${id} is <--`);
    const userDetails = await this.userModel.findAll({ where: { id } });

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: 'User not found!!' });
    }

    const url = `https://graph.facebook.com/v22.0/${waba_id}/subscribed_apps`;
    const headers = { Authorization: `Bearer ${business_token}` };
    console.log('business_token: ', business_token);
    console.log('headers: ', headers);
    ``;

    try {
      const response = await axios.post(url, {}, { headers });
      console.log('{{{{{{{{{{', response.data);
      console.log('response.status: ', response.status);
      if (response.status === 200) {
        await this.whatsappService.updateSubscribeWeb(waba_id, true);
        return res.json({ success: true, message: 'subscribed successfully' });
      } else {
        return res
          .status(400)
          .json({ message: 'Failed to subscribe the app rr' });
      }
    } catch (error) {
      console.error('Axios error:', error?.response?.data || error.message);
      return res
        .status(400)
        .json({ message: 'Failed to subscribe the app pp' });
    }
  }

  @Get('get_all_phone_details')
  async get_all_phone_details(@Query() query: PhoneDto, @Res() res: Response) {
    const { id } = query;
    if (!id) {
      return res.status(400).json({ error: 'Missing id in query parameters' });
    }
    console.log('id -->: ', id);
    const auth_details = await this.whatsappService.getAuthDetails(Number(id));
    console.log('auth_details -->: ', auth_details);
    if (
      !auth_details ||
      auth_details.message ||
      !auth_details.waba_id ||
      !auth_details.access_token
    ) {
      return res.status(400).json({
        error: 'No authentication details found for the provided user ID',
      });
    }
    try {
      const data = await this.whatsappService.get_all_phone_details({
        waba_id: auth_details.waba_id,
        business_token: auth_details.access_token,
      });
      console.log('phone details--->>: ', data);
      return res.json({ success: true, data });
    } catch (error) {
      return res
        .status(400)
        .json({ error: 'Failed to fetch phone number details' });
    }
  }

  @Post('send_template_message/:id')
  async send_template_message(
    @Param('id') id: number,
    @Body() body: SendTemplateMessageDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.whatsappService.send_template_message(
        body,
        id,
        req,
      );
      return res.status(HttpStatus.OK).json({
        success: true,
        message_id: result.message_id,
        message: 'Template message sent successfully',
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Failed to send WhatsApp template message',
        details: error.response?.data || error.stack,
      });
    }
  }

  @Get('get_all_templates')
  async get_all_templates(@Query('id') id: number, @Res() res: Response) {
    if (!id) {
      return res.status(400).json({ error: 'Missing id in query parameters' });
    }
    try {
      const data = await this.whatsappService.get_all_templates(Number(id));
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(400).json({
        error: 'Failed to fetch WhatsApp templates',
        details: error?.response?.data || error?.message,
      });
    }
  }


  @Post('send_text_message/:id')
  async send_text_message(
    @Param('id') id: number,
    @Body() body: SendTextMsgDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if(!id){
      return res.status(400).json({ error: 'id is missing in query' });
    }
    try{
      const data = await this.whatsappService.send_text_message(body, id, req);
      return res.status(HttpStatus.OK).json({
        success: true,
        message_id: data.message_id,
        message: 'Text message sent successfully',
      });
    }catch(error){
      return res.status(400).json({
        error:error.message,
        message: 'Failed to send WhatsApp text message',
        details: error.response?.data || error.stack,
      })
    }
  }


}
