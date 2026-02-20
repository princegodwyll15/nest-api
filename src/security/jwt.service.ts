import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UsersService } from 'src/users/users.service';
import { JwtRefreshDto } from './dto/jwt-refresh-dto';
import { PasswordService } from './password.service';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async signAccessToken(payload: JwtPayloadDto): Promise<string> {
    try {
      //validate payload
      if (!payload.email && !payload.sub) {
        throw new UnauthorizedException('Invalid credentials');
      }

      //sign token
      return this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async signRefreshToken(
    payload: JwtRefreshDto,
    userId: string,
  ): Promise<string> {
    //sign token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    const hashedToken = await this.passwordService.hashPassword(refreshToken);
    //save hashed refresh token to db
    await this.userService.saveRefreshToken(hashedToken, userId);
    return refreshToken;
  }

  async verifyRefreshToken(
    token: string,
    userId: string,
  ): Promise<JwtPayloadDto> {
    //get refresh token from db for this user using their id
    const getRefreshToken =
      await this.userService.findValidRefreshToken(userId);
    if (!getRefreshToken) {
      throw new ConflictException('Token not found');
    }
    const isMatch = await this.passwordService.comparePassword(
      token,
      getRefreshToken,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    //verify token
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
    return payload;
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadDto> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}
