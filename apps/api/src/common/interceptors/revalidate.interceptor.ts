import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RevalidateService } from '../../modules/revalidate/revalidate.service';

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Resources the public site renders. Leads, newsletter and users don't change
// any page, so they never trigger a refresh.
const CONTENT = new Set([
  'pages',
  'blogs',
  'layouts',
  'settings',
  'categories',
  'automation',
]);

// POST routes on content resources that only read.
const READ_ONLY = /\/blogs\/(export|import\/preview)$/;

/** Refreshes the site's cache after every successful content write. */
@Injectable()
export class RevalidateInterceptor implements NestInterceptor {
  constructor(private readonly revalidate: RevalidateService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!MUTATIONS.has(req.method)) return next.handle();

    const path = (req.path || req.url).split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const entity = segments[0] === 'api' ? segments[1] : segments[0];
    if (!CONTENT.has(entity) || READ_ONLY.test(path)) return next.handle();

    return next.handle().pipe(tap(() => this.revalidate.schedule()));
  }
}
