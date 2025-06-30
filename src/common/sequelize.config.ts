import { Injectable, OnModuleInit } from '@nestjs/common';
import { Dialect, Sequelize } from 'sequelize';
import { SequelizeModuleOptions, SequelizeOptionsFactory } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Injectable()
export class SequelizeConfigService implements OnModuleInit, SequelizeOptionsFactory {
  private sequelizeInstance: Sequelize;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const options = await this.createSequelizeOptions();
      this.sequelizeInstance = new Sequelize(options);
      await this.sequelizeInstance.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  private async getSecretFromAWS(
    secretName: string,
  ): Promise<Record<string, string>> {
    const client = new SecretsManagerClient({
      region: this.configService.get<string>('AWS_REGION'),
    });

    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }

    throw new Error('SecretString not found in Secrets Manager response.');
  }

  async createSequelizeOptions(): Promise<SequelizeModuleOptions> {
    const appEnv = this.configService.get<string>('APP_ENV');

    let dbConfig: DbConfig;

    if (appEnv === 'production') {
      const secretName = this.configService.get<string>('AWS_KEYSTRING');

      // ✅ Load from AWS Secrets Manager
      const secret = await this.getSecretFromAWS(secretName || '');

      if (!secret) {
        throw new Error('Something went wrong');
      }

      dbConfig = {
        host: secret.host,
        port: parseInt(secret.port || '3306'),
        username: secret.username,
        password: secret.password,
        database:
          this.configService.get<string>('DB_NAME') || 'auth_microservice',
      };
    } else {
      // ✅ Load from .env (development)
      dbConfig = {
        host: this.configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(this.configService.get<string>('DB_PORT') || '3306'),
        username: this.configService.get<string>('DB_USER') || 'root',
        password: this.configService.get<string>('DB_PASS') || '',
        database:
          this.configService.get<string>('DB_NAME') || 'whatsapp-application',
      };
    }

    return {
      dialect: 'mysql' as Dialect,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      autoLoadModels: true,
      synchronize: true,
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000, 
        idle: 10000,
      },
      retry: {
        max: 3,
      },
    };
  }

  getSequelizeInstance(): Sequelize {
    return this.sequelizeInstance;
  }
}
