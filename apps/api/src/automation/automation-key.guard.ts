import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { env } from '../config/env';

// Per-process random HMAC key: both values are MACed only to get equal-length
// digests for timingSafeEqual. Nothing is stored, so no password hashing needed.
const compareKey = randomBytes(32);
const digest = (value: string) =>
  createHmac('sha256', compareKey).update(value).digest();

/**
 * Machine auth for the automation runs. Compares the X-Automation-Key header to
 * AUTOMATION_API_KEY in constant time (length differences don't leak). Routes
 * are disabled entirely while the key is unset.
 */
@Injectable()
export class AutomationKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!env.automationApiKey) {
      throw new ServiceUnavailableException('Automation API is disabled');
    }

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers['x-automation-key'];
    if (typeof provided !== 'string' || !provided) {
      throw new UnauthorizedException();
    }

    if (!timingSafeEqual(digest(provided), digest(env.automationApiKey))) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
