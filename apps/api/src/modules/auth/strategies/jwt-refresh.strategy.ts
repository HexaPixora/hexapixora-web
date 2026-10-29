import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { env } from '../../../config/env';
import type { AuthRequest, JwtPayload, RefreshUser } from '../auth.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: AuthRequest) => request?.cookies?.['refresh_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: env.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    request: AuthRequest,
    payload: JwtPayload,
  ): Promise<RefreshUser> {
    const refreshToken = request.cookies?.['refresh_token'];
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return { ...safeUser, refreshToken };
  }
}
