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
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import axios from 'axios';
import { PhoneDto } from './dto/phone_details.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Post('facebook')
  async accept_code(@Body('code') code: string, @Req() req: Request) {
    console.log('req: ', req);
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
  async getAllPhoneDetails(@Query() query: PhoneDto, @Res() res: Response) {
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
      const data = await this.whatsappService.getAllPhoneDetails({
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

  @Get(':id')
  getAuthDetails(@Param('id', ParseIntPipe) id: number) {
    return this.whatsappService.getAuthDetails(id);
  }
}
