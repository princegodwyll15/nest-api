import { Injectable, Inject } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class SmsServie {
  constructor(
    @Inject('TWILIO_CLIENT') private readonly twilio: Twilio.Twilio,
  ) {}

  sendSMS(to: string, message: string) {
    return this.twilio.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });
  }
}
