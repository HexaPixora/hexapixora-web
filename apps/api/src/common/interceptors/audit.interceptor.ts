import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

const MUTATIONS: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Writes an AuditLog row for every successful authenticated mutation, giving an
 * activity trail of who changed what. Gated on `req.user`, so public submissions
 * (contact form, newsletter) never bloat the log. Audit writes are best-effort:
 * a failure is logged but never breaks the request.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const action = MUTATIONS[req.method];
    const user = req.user;

    // Only audit authenticated mutations.
    if (!action || !user?.id) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((body) => {
        // Derive entity from the path: /api/blogs/:id → "blogs".
        const segments = String(req.path || req.url).split('?')[0].split('/').filter(Boolean);
        const entity = segments[0] === 'api' ? segments[1] : segments[0];
        const rawId = req.params?.id ?? body?.id ?? body?.data?.id ?? null;

        this.prisma.auditLog
          .create({
            data: {
              userId: user.id,
              action,
              entity: entity ?? 'unknown',
              entityId: rawId != null ? String(rawId) : null,
            },
          })
          .catch((err) => this.logger.warn(`Audit write failed: ${err.message}`));
      }),
    );
  }
}
