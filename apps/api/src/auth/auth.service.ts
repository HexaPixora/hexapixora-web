import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      expiresIn: '7d',
    });

    // Store refresh token in the database
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
}
