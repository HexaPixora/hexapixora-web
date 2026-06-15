import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@repo/database';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Section } from '../permissions';

/**
 * Grants access when the user is ADMIN/SUPER_ADMIN, or when a TEAM_MEMBER has
 * been granted every section required by the @Permissions() decorator. Pair
 * with JwtAuthGuard (which populates request.user).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Section[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      return true;
    }

    const granted: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    return required.every((section) => granted.includes(section));
  }
}
