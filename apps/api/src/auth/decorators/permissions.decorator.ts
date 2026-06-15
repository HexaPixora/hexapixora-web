import { SetMetadata } from '@nestjs/common';
import { Section } from '../permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require the current user to have access to the given section(s).
 * ADMIN/SUPER_ADMIN always pass; a TEAM_MEMBER must have every listed section
 * in their granted permissions. Use with PermissionsGuard.
 */
export const Permissions = (...sections: Section[]) =>
  SetMetadata(PERMISSIONS_KEY, sections);
