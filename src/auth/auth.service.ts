import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PasswordService } from '../security/password.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from 'src/security/jwt.service';
import { UserDataDto, UserSignInResponse } from './dto/user-data.dto';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { JwtPayloadDto } from 'src/security/dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly MailService: MailService,
    private readonly otpService: OtpService,
  ) {}

  async signUp(dto: RegisterAuthDto): Promise<UserDataDto> {
    const isUserExist = await this.userService.findOneByEmail(dto.email);

    if (isUserExist) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      dto.password,
    );

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    const refreshTokenPayload = {
      userId: user.id,
    };

    const accessTokenPayload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
    };
    //sign tokens
    const accessToken =
      await this.jwtService.signAccessToken(accessTokenPayload);
    const refreshToken = await this.jwtService.signRefreshToken(
      refreshTokenPayload,
      user.id,
    );
    //generate otp
    const otp = this.otpService.generateOtp();
    //send email
    await this.MailService.sendEmail(user.email, user.name, otp);

    const { password, ...safeUser } = user;
    //return user data, access token and refresh token
    return {
      user: safeUser,
      otp,
      accessToken,
      refreshToken,
    };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<UserSignInResponse> {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }
    //find user by email
    const user = await this.userService.findOneByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    //validate and check password
    const isPasswordValid = await this.passwordService.comparePassword(
      data.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const checkIfUserIsVerified = await this.userService.checkIfUserIsVerified(
      user.id,
    );
    if (!checkIfUserIsVerified) {
      //generate otp
      const otp = this.otpService.generateOtp();
      //save otp in db
      await this.otpService.saveOtp(user.id, otp);
      //send email
      await this.MailService.sendEmail(user.email, user.username, otp);
      return {
        user: { id: user.id, email: user.email },
        otpRequired: true,
        message: 'Please verify your email with the OTP sent',
      };
    }
    //generate  access token
    const accessToken = await this.jwtService.signAccessToken({
      sub: user.id,
      email: user.email,
    });

    //generate refresh token
    const refreshToken = await this.jwtService.signRefreshToken(
      {
        userId: user.id,
      },
      user.id,
    );

    //save refresh token
    await this.userService.saveRefreshToken(refreshToken, user.id);

    //user data with token
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  //get user profile by id
  async getUserProfile(id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
