import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthRequest } from '../auth.types';
import { Role } from '@hexapixora/database';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { SectionKey as Section } from '@hexapixora/contracts/permissions';

/**
 * Grants access when the user is ADMIN/SUPER_ADMIN, or when a TEAM_MEMBER has
 * been granted every section required by the @Permissions() decorator. Pair
 * with JwtAuthGuard (which populates request.user).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Section[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (!user) return false;

    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      return true;
    }

    return required.every((section) => user.permissions.includes(section));
  }
}
