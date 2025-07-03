import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createErrorResponse } from '../decorators/api-response.decorator';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  details?: unknown;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: unknown = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as ExceptionResponse;
      message = (responseObj.message as string) || message;
      error = responseObj.error || error;
      details = responseObj.details || null;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    const errorResponse = createErrorResponse(message, error, details);
    errorResponse.path = request.url;

    response.status(status).json(errorResponse);
  }
}
