import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async checkIfUserIsVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user?.isVerified || false;
  }

  async saveRefreshToken(token: string, userId: string): Promise<string> {
    console.log('Saving refresh token for user:', userId);
    await this.prisma.refreshToken.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        userId,
      },
    });
    return token;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findValidRefreshToken(userId: string): Promise<string> {
    console.log('Finding and checking refresh token for user:', userId);
    const timeOfRequestingRefreshToken = new Date();
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: timeOfRequestingRefreshToken, // Not expired yet
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found');
    }

    // Check if difference between expiresAt and now is <= 7 days
    const timeDiff =
      refreshToken.expiresAt.getTime() - timeOfRequestingRefreshToken.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      throw new ConflictException('Expired token');
    }
    return refreshToken.token;
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
