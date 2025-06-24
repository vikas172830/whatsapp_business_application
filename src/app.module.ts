import { Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';

import { WhatsappModule } from './whatsapp_accounts/whatsapp.module';
import { User } from './user/user.model';
import { WhatsappController } from './whatsapp_accounts/whatsapp.controller';
import { whatsapp_accounts } from './whatsapp_accounts/whatsapp.model';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { WhatsappService } from './whatsapp_accounts/whatsapp.service';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'whatsapp-application',
      logging: true,
      models: [User],
      autoLoadModels: true,
      synchronize: true,
    }),
    UserModule,
    WhatsappModule,
    AuthModule,
  ],
  controllers: [AppController],

  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('user', 'whatsapp');
  }
}
