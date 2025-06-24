import {
  Injectable,
  HttpException,
  HttpStatus,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { whatsapp_accounts } from './whatsapp.model';
import { User } from 'src/user/user.model';
import axios from 'axios';
import { PhoneDto } from './dto/phone_details.dto';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(whatsapp_accounts)
    private readonly whatsappModel: typeof whatsapp_accounts,
  ) {}

  async accept_code(code: string, req: any) {
    console.log('req: ', req.body);
    console.log('code: ', code);
    const appId = '1217226259377441';
    const appSecret = 'ef2826745c3cd1966497c9920a98a459';
    // const redirectUri = 'http://localhost:3000/redirect-url';

    try {
      const url = 'https://graph.facebook.com/v22.0/oauth/access_token';
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          client_id: appId,
          client_secret: appSecret,
          code: code.trim(),
          grant_type: 'orization_code',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('--->', data);

      console.log('access_token:--> ', data.access_token);

      const dd = await this.whatsappModel.create({
        phone_number_id: req.body.phone_number_id,
        waba_id: req.body.waba_id,
        business_id: req.body.business_id,
        access_token: data.access_token,
      });

      console.log('dd created successfully-->: ', dd);
      // Optional: Fetch business info or save the token
      return {
        success: true,
        message: 'saved success fully',
      };
    } catch (err) {
      console.error(
        'Error exchanging code for token:',
        err.response?.data || err,
      );
      throw new HttpException('Token exchange failed', HttpStatus.BAD_REQUEST);
    }
  }

  async getAuthDetails(id: number) {
    const details = await this.whatsappModel.findByPk(id);
    console.log('details: ', details);
    if (!details) {
      return { message: 'Details not found of this id ' };
    } else {
      return {
        // details,
        waba_id: details.dataValues.waba_id,
        access_token: details.dataValues.access_token,
      };
    }
  }

  async updateSubscribeWeb(wabaId: string, value: boolean) {
    return await this.whatsappModel.update(
      { subscribe_web: value },
      { where: { waba_id: wabaId } },
    );
  }

  async getUsers() {
    return await this.whatsappModel.findAll();
  }

  // whatsapp.service.ts
  async subscribe_app(id: number, waba_id: string, business_token: string) {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const url = `https://graph.facebook.com/v22.0/${waba_id}/subscribed_apps`;
    const headers = {
      Authorization: `Bearer ${business_token}`,
    };

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      await this.updateSubscribeWeb(waba_id, true);
      return { success: true };
    } else {
      throw new HttpException(
        'Failed to subscribe the app',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllPhoneDetails(auth_details: {
    waba_id: string;
    business_token: string;
  }) {
    console.log('auth_details: ', auth_details);
    const url = `https://graph.facebook.com/v22.0/${auth_details.waba_id}/phone_numbers`;
    console.log('url:--> ', url);
    const params = {
      fields:
        'id,cc,country_dial_code,display_phone_number,verified_name,status,quality_rating,search_visibility,platform_type,code_verification_status',
      access_token: auth_details.business_token,
    };
    console.log('params++++: ', params);
    try {
      const response = await axios.get(url, { params });
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error(
        'Error fetching phone details:',
        error?.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to fetch phone number details',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
