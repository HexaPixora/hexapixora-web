import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TokenType, VerificationToken } from '@repo/database';

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Single-use magic-link tokens for invites, password resets and email changes.
 * Tokens are cryptographically random (infeasible to guess) and consumed on use.
 */
@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  /** Issue a token for a user, replacing any prior token of the same type. */
  async issue(
    userId: string,
    type: TokenType,
    opts?: { newEmail?: string; ttlMs?: number },
  ): Promise<string> {
    await this.prisma.verificationToken.deleteMany({ where: { userId, type } });
    const token = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token,
        type,
        userId,
        newEmail: opts?.newEmail ?? null,
        expiresAt: new Date(Date.now() + (opts?.ttlMs ?? DEFAULT_TTL_MS)),
      },
    });
    return token;
  }

  /** Validate + consume (delete) a token. Throws if missing / wrong-type / expired. */
  async consume(token: string, type: TokenType): Promise<VerificationToken> {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });
    if (!record || record.type !== type) {
      throw new BadRequestException('This link is invalid.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      await this.prisma.verificationToken
        .delete({ where: { id: record.id } })
        .catch(() => undefined);
      throw new BadRequestException('This link has expired. Please request a new one.');
    }
    await this.prisma.verificationToken.delete({ where: { id: record.id } });
    return record;
  }
}
