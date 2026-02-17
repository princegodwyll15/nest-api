import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly emailTransporter: nodemailer.Transporter) {}

  async sendEmail(
    to: string,
    subject: string = 'Verify your email',
    otp: string,
  ) {
    const emailText = 'This is your otp enter this code: ' + otp;
    try {
      const result = await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text: emailText,
        html: `<p>${emailText}</p>`,
      });
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to send email');
    }
  }
}
