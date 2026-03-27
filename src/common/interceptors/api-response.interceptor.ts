import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseShape {
  ok?: boolean;
  data?: unknown;
  message?: string;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === 'object' && 'ok' in data) {
          return data as ResponseShape;
        }
        return { ok: true, data };
      }),
    );
  }
}
