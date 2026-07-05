import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { TokenType } from '@repo/database';
import { env } from '../config/env';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private tokens: TokensService,
    private mail: MailService,
  ) {}

  private async siteName(): Promise<string> {
    const s = await this.prisma.siteSetting
      .findUnique({ where: { id: 'global' } })
      .catch(() => null);
    return s?.siteName || 'HexaPixora';
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // INVITED users have a null password until they accept — they can't log in.
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: env.jwtAccessSecret,
      expiresIn: '15m',
    });
    // Long-lived refresh token so an open session isn't cut off on a timer. It's
    // rotated on every /auth/refresh and stored only in a session cookie, so the
    // session still ends when the admin logs out or closes the browser.
    const refreshToken = this.jwtService.sign(payload, {
      secret: env.jwtRefreshSecret,
      expiresIn: '30d',
    });

    // Store refresh token in the database
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, rt: string) {
    const session = await this.prisma.session.findUnique({
      where: { token: rt },
    });
    
    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Access Denied');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Access Denied');

    // Remove old session and generate new tokens (Token rotation)
    await this.prisma.session.delete({ where: { id: session.id } });

    return this.login(user);
  }

  async logout(userId: string, rt: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token: rt,
      },
    });
  }

  /**
   * Start a password reset. Always resolves the same way (caller returns a
   * generic message) so the endpoint never reveals whether an account exists.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') return; // no invited/nonexistent accounts
    const token = await this.tokens.issue(user.id, TokenType.PASSWORD_RESET);
    await this.mail.sendPasswordReset({
      to: user.email,
      name: user.name,
      url: `${env.appUrl}/reset-password?token=${token}`,
      siteName: await this.siteName(),
    });
  }

  /** Complete a password reset: set the new password and kill existing sessions. */
  async resetPassword(token: string, password: string): Promise<void> {
    const record = await this.tokens.consume(token, TokenType.PASSWORD_RESET);
    const hashed = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed, status: 'ACTIVE' },
    });
    // Force re-login everywhere after a reset.
    await this.prisma.session.deleteMany({ where: { userId: record.userId } });
  }
}
