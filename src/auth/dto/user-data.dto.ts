import { User } from 'src/generated/prisma/client';

type SafeUser = Omit<User, 'password'>;

type UserOtpData = Pick<User, 'id' | 'email'>;

export class UserDataDto {
  user: SafeUser;
  accessToken: string;
  otp?: string;
  refreshToken: string;
}

export class userOtpRecord {
  user: UserOtpData;
  otpRequired: boolean;
  message: string;
}

export type UserSignInResponse = UserDataDto | userOtpRecord;
