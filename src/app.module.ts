import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityModule } from './security/security.module';
import { SmsModule } from './sms/sms.module';
import { OtpModule } from './otp/otp.module';
import { ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: config.get('GMAIL_USER')!,
            clientId: config.get('GMAIL_CLIENT_ID'),
            clientSecret: config.get('GMAIL_CLIENT_SECRET'),
            refreshToken: config.get('GMAIL_REFRESH_TOKEN'),
          },
        };
      },
    }),
    SmsModule,
    PrismaModule,
    SecurityModule,
    AuthModule,
    OtpModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
