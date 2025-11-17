/**
 * API Gateway Response Utilities
 * Provides standardized response formatting for Lambda functions
 */

import { APIGatewayProxyResponse } from '../types/model';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
};

/**
 * Creates a successful API Gateway response
 */
export function successResponse(
  data: unknown,
  statusCode: number = 200,
  headers?: Record<string, string>
): APIGatewayProxyResponse {
  return {
    statusCode,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: JSON.stringify(data),
  };
}

/**
 * Creates an error API Gateway response
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, unknown>,
  headers?: Record<string, string>
): APIGatewayProxyResponse {
  const errorBody: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  } = {
    message,
  };

  if (code) {
    errorBody.code = code;
  }

  if (details) {
    errorBody.details = details;
  }

  return {
    statusCode,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: JSON.stringify(errorBody),
  };
}

/**
 * Creates a CORS preflight response
 */
export function corsResponse(headers?: Record<string, string>): APIGatewayProxyResponse {
  return {
    statusCode: 200,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: JSON.stringify({}),
  };
}

/**
 * Parses API Gateway event body
 */
export function parseBody<T>(body: string | null | undefined): T {
  if (!body) {
    throw new Error('Request body is required');
  }

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts path parameters from API Gateway event
 */
export function getPathParameter(
  event: { pathParameters?: Record<string, string> | null },
  key: string
): string {
  const value = event.pathParameters?.[key];
  if (!value) {
    throw new Error(`Missing required path parameter: ${key}`);
  }
  return value;
}

/**
 * Extracts query parameters from API Gateway event
 */
export function getQueryParameter(
  event: { queryStringParameters?: Record<string, string> | null },
  key: string,
  defaultValue?: string
): string | undefined {
  return event.queryStringParameters?.[key] ?? defaultValue;
}

/**
 * Extracts user ID from Cognito identity in API Gateway event
 */
export function getUserId(event: {
  requestContext?: {
    identity?: {
      cognitoIdentityId?: string;
      userArn?: string;
    };
  };
}): string {
  const identityId = event.requestContext?.identity?.cognitoIdentityId;
  if (!identityId) {
    throw new Error('User ID not found in request context');
  }
  return identityId;
}

