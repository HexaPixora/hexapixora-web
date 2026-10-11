import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { env } from '../config/env';

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/**
 * Machine auth for the scheduled Claude routines. Compares the X-Automation-Key
 * header to AUTOMATION_API_KEY in constant time (both hashed first so length
 * differences don't leak). Routes are disabled entirely while the key is unset.
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

    if (!timingSafeEqual(sha256(provided), sha256(env.automationApiKey))) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
