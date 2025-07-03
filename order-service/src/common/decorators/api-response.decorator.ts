import { ApiResponse } from '../interfaces/api-response.interface';

export function createApiResponse<T>(
  data: T,
  message: string = 'Success',
  success: boolean = true,
): ApiResponse<T> {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  message: string,
  error: string,
  details?: unknown,
): ApiResponse<null> {
  return {
    success: false,
    message,
    error,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success',
): any {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
}
