import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createApiResponse } from '../decorators/api-response.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: any): ApiResponse<T> => {
        // Nếu data đã có format ApiResponse thì trả về nguyên bản
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            path: request.url,
          } as ApiResponse<T>;
        }

        // Wrap data theo format chuẩn
        return createApiResponse(data, 'Success', true) as ApiResponse<T>;
      }),
    );
  }
}
