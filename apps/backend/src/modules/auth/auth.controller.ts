import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    return this.authService.login(body.email || '', body.password || '');
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken?: string }) {
    return this.authService.refreshToken(body.refreshToken || '');
  }

  @Post('logout')
  logout() {
    return { message: 'Berhasil logout' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: any) {
    return { user: req.user };
  }
}
