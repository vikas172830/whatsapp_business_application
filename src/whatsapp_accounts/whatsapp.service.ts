import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { whatsapp_accounts } from './whatsapp.model';
import { User } from 'src/user/user.model';
import axios from 'axios';
import { SendTemplateMessageDto } from './dto/sentTamplateMessage.dto';
import { preview } from 'vite';
import { SendTextMsgDto } from './dto/sendTextMsg.dto';

@Injectable()
export class WhatsappService {
  logger: any;
  httpService: any;
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(whatsapp_accounts)
    private readonly whatsappModel: typeof whatsapp_accounts,
  ) {}

  private readonly FB_GRAPH_API_URL = 'https://graph.facebook.com/v22.0';

  async accept_code(code: string, req: any) {
    const appId = '1217226259377441';
    const appSecret = 'ef2826745c3cd1966497c9920a98a459';

    try {
      const url = `${this.FB_GRAPH_API_URL}/oauth/access_token`;
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          client_id: appId,
          client_secret: appSecret,
          code: code.trim(),
          grant_type: 'authorization_code',
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

  async updateSubscribeWeb(wabaId: string, value: boolean) {
    return await this.whatsappModel.update(
      { subscribe_web: value },
      { where: { waba_id: wabaId } },
    );
  }

  async getUsers() {
    return await this.whatsappModel.findAll();
  }

  async subscribe_app(id: number, waba_id: string, business_token: string) {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const url = `${this.FB_GRAPH_API_URL}/${waba_id}/subscribed_apps`;
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

  async get_all_phone_details(auth_details: {
    waba_id: string;
    business_token: string;
  }) {
    const url = `${this.FB_GRAPH_API_URL}/${auth_details.waba_id}/phone_numbers`;
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

  async send_template_message(
    dto: SendTemplateMessageDto,
    id: number,
    req: any,
  ): Promise<any> {
    const { to, template_name } = dto;
    const auth_details = await this.getAuthDetails(id);

    if (!auth_details) {
      throw new Error('No authentication details found.');
    }

    const url = `${this.FB_GRAPH_API_URL}/${auth_details.phone_number_id}/messages`;

    const body: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template_name,
        language: { code: 'en_US' },
        components: [],
      },
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth_details.access_token}`,
    };

    try {
      const response = await axios.post(url, JSON.stringify(body), { headers });
      const data = response.data;
      const message_id = data?.messages?.[0]?.id || 'No ID';
      return {
        success: true,
        message_id,
        message: 'Template message sent successfully',
      };
    } catch (error) {
      throw {
        error:
          error.error ||
          error.message ||
          'Failed to send WhatsApp template message server error',
        details: error.details || error.response?.data || error.stack,
      };
    }
  }

  async get_all_templates(id: number) {
    const auth_details = await this.get_all_templates(id);
    if (!auth_details) {
      throw new HttpException(
        'No authentication details found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const waba_id = auth_details.waba_id;
    const access_token = auth_details.access_token;

    const url = `${this.FB_GRAPH_API_URL}/${waba_id}/message_templates`;
    const params = { access_token };
    try {
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      console.error(
        'Error fetching templates:',
        error?.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to fetch WhatsApp templates',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAuthDetails(id: number) {
    const details = await this.whatsappModel.findByPk(id);
    if (!details) {
      return { message: 'Details not found of this id ' };
    } else {
      return {
        phone_number_id: details.dataValues.phone_number_id,
        waba_id: details.dataValues.waba_id,
        access_token: details.dataValues.access_token,
      };
    }
  }

  async send_text_message(
    dto: SendTextMsgDto,
    id: number,
    req: any,
  ): Promise<any> {
    const { to, text_message } = dto;
    const auth_details = await this.getAuthDetails(id);

    if (!auth_details) {
      throw new Error('No authentication details found.');
    }

    const url = `${this.FB_GRAPH_API_URL}/${auth_details.phone_number_id}/messages`;

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text_message,
      },
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth_details.access_token}`,
    };

    try {
      const response = await axios.post(url, JSON.stringify(body), { headers });
      const data = response.data;
      const message_id = data?.messages?.[0]?.id || 'No ID';
      return {
        success: true,
        message_id,
        message: 'Text message sent successfully',
      };
    } catch (error) {
      throw {
        error:
          error.error ||
          error.message ||
          'Failed to send WhatsApp text message server error',
        details: error.details || error.response?.data || error.stack,
      };
    }
  }
}
