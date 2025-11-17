/**
 * Error Handling Utilities
 * Provides standardized error handling and logging
 */

import { errorResponse } from './api-response';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Handles errors and returns appropriate API Gateway response
 */
export function handleError(error: unknown): {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
} {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.code, error.details);
  }

  if (error instanceof Error) {
    return errorResponse(
      error.message || 'An unexpected error occurred',
      500,
      'INTERNAL_ERROR',
      { errorType: error.name }
    );
  }

  return errorResponse('An unexpected error occurred', 500, 'INTERNAL_ERROR');
}

/**
 * Wraps async Lambda handler with error handling
 */
export function withErrorHandling<TEvent, TResult>(
  handler: (event: TEvent) => Promise<TResult>
): (event: TEvent) => Promise<TResult> {
  return async (event: TEvent): Promise<TResult> => {
    try {
      return await handler(event);
    } catch (error) {
      const response = handleError(error);
      return response as TResult;
    }
  };
}

