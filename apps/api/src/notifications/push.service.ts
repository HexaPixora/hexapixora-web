import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../config/env';

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Browser Web Push (VAPID). Stores per-device subscriptions and fans out
 * payloads to them. No-ops when VAPID keys aren't configured, so the in-app
 * bell keeps working regardless.
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private configured = false;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    if (env.push.publicKey && env.push.privateKey) {
      try {
        webpush.setVapidDetails(env.push.subject, env.push.publicKey, env.push.privateKey);
        this.configured = true;
      } catch (err) {
        this.logger.error(`Invalid VAPID config: ${(err as Error).message}`);
      }
    } else {
      this.logger.warn('VAPID keys not set — Web Push disabled (the in-app bell still works).');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  publicKey(): string {
    return env.push.publicKey;
  }

  async subscribe(userId: string, sub: PushSub) {
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return { ok: false };
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return { ok: true };
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { ok: true };
  }

  /** Fan a payload out to every stored subscription; prune expired ones (404/410). */
  async sendToAll(payload: {
    title: string;
    body?: string | null;
    url?: string | null;
    tag?: string | null;
  }): Promise<void> {
    if (!this.configured) return;
    const subs = await this.prisma.pushSubscription.findMany().catch(() => []);
    if (subs.length === 0) return;

    const data = JSON.stringify({
      title: payload.title,
      body: payload.body || '',
      url: payload.url || '/admin',
      tag: payload.tag || undefined,
    });

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            data,
          );
        } catch (err: any) {
          const status = err?.statusCode;
          if (status === 404 || status === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => undefined);
          } else {
            this.logger.error(`Push send failed (${status ?? '?'}): ${err?.message}`);
          }
        }
      }),
    );
  }
}
