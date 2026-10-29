import type { Request } from 'express';
import type { User } from '@hexapixora/database';

/** The signed-in user on `req.user`: the account without its password hash. */
export type AuthUser = Omit<User, 'password'>;

/** What the refresh strategy puts on `req.user`. */
export type RefreshUser = AuthUser & { refreshToken?: string };

/** Claims inside the access and refresh JWTs. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
}

/** A request whose cookies are parsed and whose user is set by a guard. */
export type AuthRequest<U = AuthUser> = Omit<Request, 'cookies' | 'user'> & {
  cookies: Record<string, string | undefined>;
  user?: U;
};
