import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: RegisterAuthDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }
  @UseGuards(AuthGuard)
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.authService.getUserProfile(id);
  }
}
