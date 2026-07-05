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

  // --- Admin user management (password hash is never returned) ---

  async findAllSafe() {
    return this.prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMember(input: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    permissions?: string[];
  }) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role ?? Role.TEAM_MEMBER,
        permissions: input.permissions ?? [],
      },
      select: SAFE_SELECT,
    });
  }

  async updateMember(
    id: string,
    input: {
      name?: string;
      role?: Role;
      permissions?: string[];
      password?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.role !== undefined) data.role = input.role;
    if (input.permissions !== undefined) data.permissions = input.permissions;
    if (input.password) data.password = await bcrypt.hash(input.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_SELECT,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }

  // --- Self-service profile (any logged-in user, on their OWN account) ---

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

  // --- Invitations (admin creates the user; user sets their own password) ---

  async invite(
    input: { email: string; name?: string; role?: Role; permissions?: string[] },
    inviterName?: string | null,
  ) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role ?? Role.TEAM_MEMBER,
        permissions: input.permissions ?? [],
        status: 'INVITED',
        password: null,
      },
      select: SAFE_SELECT,
    });
    await this.sendInviteEmail(user.id, user.email, user.name, inviterName);
    return user;
  }

  async resendInvite(id: string, inviterName?: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'INVITED') {
      throw new BadRequestException('This user has already accepted their invite.');
    }
    await this.sendInviteEmail(user.id, user.email, user.name, inviterName);
    return { message: 'Invite resent.' };
  }

  private async sendInviteEmail(
    userId: string,
    email: string,
    name: string | null,
    inviterName?: string | null,
  ) {
    const token = await this.tokens.issue(userId, TokenType.INVITE, {
      ttlMs: INVITE_TTL_MS,
    });
    await this.mail.sendInvite({
      to: email,
      name,
      url: `${env.appUrl}/accept-invite?token=${token}`,
      siteName: await this.siteName(),
      inviterName,
    });
  }

  /** An invited user accepts and sets their password → account becomes ACTIVE. */
  async acceptInvite(token: string, password: string) {
    const record = await this.tokens.consume(token, TokenType.INVITE);
    const hashed = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed, status: 'ACTIVE' },
    });
    return { message: 'Your account is ready. You can now log in.' };
  }
}
