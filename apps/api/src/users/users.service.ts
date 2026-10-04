import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { User, Prisma, Role, TokenType } from '@repo/database';
import { env } from '../config/env';
import * as bcrypt from 'bcryptjs';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Fields safe to return to clients (everything except the password hash).
const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  permissions: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
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

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    // Password is optional now: INVITED users are created without one and set it
    // when they accept their invite. Hash it only when present.
    const password = data.password
      ? await bcrypt.hash(data.password, await bcrypt.genSalt(10))
      : null;

    return this.prisma.user.create({
      data: {
        ...data,
        password,
      },
    });
  }

  // --- Self-service profile (the logged-in user, on their OWN account) ---

  async updateProfile(id: string, input: { name?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { name: input.name },
      select: SAFE_SELECT,
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestException('Your current password is incorrect.');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    return { message: 'Password updated.' };
  }

  /** Step 1 of an email change: email a magic link to the NEW address. */
  async requestEmailChange(id: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException('That is already your email address.');
    }
    const taken = await this.findByEmail(newEmail);
    if (taken) throw new ConflictException('That email is already in use.');

    const token = await this.tokens.issue(id, TokenType.EMAIL_CHANGE, { newEmail });
    await this.mail.sendEmailChangeVerification({
      to: newEmail,
      name: user.name,
      url: `${env.appUrl}/verify-email?token=${token}`,
      siteName: await this.siteName(),
    });
    return { message: 'Check your new inbox — we sent a link to confirm the change.' };
  }

  /** Step 2 of an email change: consume the token and apply the new address. */
  async confirmEmailChange(token: string) {
    const record = await this.tokens.consume(token, TokenType.EMAIL_CHANGE);
    if (!record.newEmail) throw new BadRequestException('This link is invalid.');
    const taken = await this.findByEmail(record.newEmail);
    if (taken && taken.id !== record.userId) {
      throw new ConflictException('That email is already in use.');
    }
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { email: record.newEmail },
    });
    return { message: 'Your email address has been updated.' };
  }
}
