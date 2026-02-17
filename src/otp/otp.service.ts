import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OtpService {
  private readonly otpLength = 6;
  private readonly otpExpiration = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  //generate otp six number otp
  generateOtp(): string {
    return Math.floor(Math.random() * 10 ** this.otpLength)
      .toString()
      .padStart(this.otpLength, '0');
  }

  //create otp for users with user id
  //save it in the otp table for each login request after 30mins or after logout
  //otp data must contain user id and otp
  saveOtp(userId: string, code: string) {
    return this.prisma.oTP.create({
      data: {
        userId,
        used: false,
        code: code,
        expiresAt: new Date(Date.now() + this.otpExpiration),
      },
    });
  }

  //verify otp
  //otp data must contain otp and user id
  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const normalizedUserId = userId.toString().trim();
    const normalizedOtp = otp.toString().trim();

    // Get latest unused OTP
    const userOtpRecord = await this.prisma.oTP.findFirst({
      where: { userId: normalizedUserId, used: false },
      orderBy: { createdAt: 'desc' },
    });

    console.log('User OTP Record:', userOtpRecord);
    console.log('Provided OTP:', normalizedOtp);

    if (!userOtpRecord) {
      throw new ConflictException('No OTP exists or already used');
    }
    if (userOtpRecord.code !== normalizedOtp) {
      throw new BadRequestException('Invalid OTP');
    }
    if (userOtpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark as used
    await this.prisma.oTP.update({
      where: { id: userOtpRecord.id },
      data: { used: true },
    });

    console.log('OTP Marked as Used');

    //delete all unused otps
    await this.prisma.oTP.deleteMany({
      where: { userId: normalizedUserId, used: false },
    });
    console.log('All unused OTPs deleted for this user');

    //mark user as verified
    await this.prisma.user.update({
      where: { id: normalizedUserId },
      data: { isVerified: true },
    });
    //veryfy user account
    console.log('User account verfied succesfully');

    return true;
  }

  async resendOtp(userId: string, email: string) {
    try {
      await this.prisma.oTP.deleteMany({
        where: {
          userId,
          used: false,
        },
      });
      //send otp to user email
      //TODO: send otp to user email
      const result = this.mailService.sendEmail(email, 'Test', 'Test');
      //create new otp
      const otp = this.generateOtp();
      const otpRecord = await this.saveOtp(userId, otp);
      if (!otpRecord) {
        throw new InternalServerErrorException('Failed to create OTP');
      }

      console.log('Email sent response', result);
      return otpRecord;
    } catch (err) {
      console.error('Error resending OTP:', err);
      throw new InternalServerErrorException('Failed to resend OTP');
    }
  }
}
