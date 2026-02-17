import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('verify/signup')
  verifyOnSignup(@Body() body: VerifyOtpDto) {
    return this.otpService.verifyOtp(body.userId, body.code);
  }

  @Post('verify/login')
  verifyOnLogin(@Body() body: VerifyOtpDto) {
    return this.otpService.verifyOtp(body.userId, body.code);
  }

  @Post('resend')
  resendOtp(@Body() body: { userId: string; email: string }) {
    return this.otpService.resendOtp(body.userId, body.email);
  }
}
