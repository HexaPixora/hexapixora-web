import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { clientIp } from '../client-ip';

/** The global rate limit, counted per visitor rather than per proxy. */
@Injectable()
export class ClientThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(clientIp(req as Parameters<typeof clientIp>[0]));
  }
}
