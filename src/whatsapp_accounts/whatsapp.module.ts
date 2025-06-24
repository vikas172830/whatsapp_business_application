import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { whatsapp_accounts } from './whatsapp.model';
import { User } from 'src/user/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User, whatsapp_accounts])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
