import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Twilio } from 'twilio';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'TWILIO_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Twilio(
          config.get('TWILIO_ACCOUNT_SID'),
          config.get('TWILIO_AUTH_TOKEN'),
        );
      },
    },
  ],
})
export class SmsModule {}
