import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { env } from '../../config/env';

// Saves arrive in bursts (a page save, then its layout, then settings), so
// they collapse into one site refresh.
const DEBOUNCE_MS = 2_000;
const TIMEOUT_MS = 5_000;

/**
 * Tells the site to drop its cached pages after content changes, so edits show
 * up immediately instead of after the pages' revalidate interval. Best-effort:
 * a failure is logged and the normal interval still refreshes the site.
 */
@Injectable()
export class RevalidateService implements OnModuleDestroy {
  private readonly logger = new Logger(RevalidateService.name);
  private timer: NodeJS.Timeout | null = null;

  get enabled() {
    return Boolean(env.revalidate.url && env.revalidate.secret);
  }

  schedule() {
    if (!this.enabled) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.send();
    }, DEBOUNCE_MS);
  }

  async send() {
    try {
      const res = await fetch(env.revalidate.url, {
        method: 'POST',
        headers: { 'X-Revalidate-Secret': env.revalidate.secret },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) this.logger.warn(`Site revalidation returned ${res.status}`);
    } catch (err) {
      this.logger.warn(`Site revalidation failed: ${(err as Error).message}`);
    }
  }

  onModuleDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}
