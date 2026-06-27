import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { loginSchema } from '@inside/schemas';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = loginSchema.parse(body);
    const result = await this.authService.login(input.email, input.password, input.tenantSlug);
    const crossSite = process.env.COOKIE_SAME_SITE === 'none';
    response.cookie('inside_session', result.sessionId, {
      httpOnly: true,
      sameSite: crossSite ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' || crossSite,
      path: '/',
      expires: result.expiresAt,
    });
    return { user: result.user };
  }

  @Get('me')
  me(@CurrentAuth() auth: AuthContext) {
    return this.authService.me(auth);
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.inside_session as string | undefined);
    const crossSite = process.env.COOKIE_SAME_SITE === 'none';
    response.clearCookie('inside_session', {
      httpOnly: true,
      sameSite: crossSite ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' || crossSite,
      path: '/',
    });
    return { success: true };
  }
}
