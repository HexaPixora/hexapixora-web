import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { env } from '../../../config/env';

/** The Web Push routes answer 404 when FEATURES switches push off. */
@Injectable()
export class PushEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (!env.features.push) throw new NotFoundException();
    return true;
  }
}
