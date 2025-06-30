import { Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { WhatsappModule } from './whatsapp_accounts/whatsapp.module';
import { User } from './user/user.model';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { CustomLogger } from './common/logger/logger.service';

import { SequelizeConfigService } from './common/sequelize.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // SequelizeModule.forRoot({
    //   dialect: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: '',
    //   database: 'whatsapp-application',
    //   logging: true,
    //   models: [User],
    //   autoLoadModels: true,
    //   synchronize: true,
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
      imports: [ConfigModule],
    }), 
    UserModule,
    WhatsappModule,
    AuthModule,
  ],
  controllers: [AppController],

  providers: [AppService, JwtService, CustomLogger, SequelizeConfigService],
})
export class AppModule {}

// implements NestModule {
//   configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
//     consumer.apply(AuthMiddleware).forRoutes('user', 'whatsapp');
//   }
// }
