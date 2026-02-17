import { Module, DynamicModule } from '@nestjs/common';
import { MailModuleOptions } from './dto/mail-dto.dto';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

@Module({})
export class MailModule {
  static forRootAsync(options: {
    inject?: any[];
    useFactory: (...args: any[]) => MailModuleOptions;
    isGlobal?: boolean;
  }): DynamicModule {
    return {
      module: MailModule,
      global: options.isGlobal || false,
      providers: [
        {
          provide: 'MAIL_OPTIONS',
          inject: options.inject || [],
          useFactory: options.useFactory,
        },
        {
          provide: MailService,
          useFactory: (mailOptions: MailModuleOptions) => {
            const transporter = nodemailer.createTransport(mailOptions);
            return new MailService(transporter);
          },
          inject: ['MAIL_OPTIONS'],
        },
      ],
      exports: [MailService],
    };
  }
}
