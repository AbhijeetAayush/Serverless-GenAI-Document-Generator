/**
 * Validation Utilities
 * Provides validation functions using Zod-like patterns
 */

import { ValidationError } from './error-handler';

/**
 * Validates that a value is not empty
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value;
}

/**
 * Validates that a value is a valid UUID format
 */
export function validateUUID(value: string, fieldName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return value as T;
}

/**
 * Validates that a number is within a range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
  }
  return value;
}

/**
 * Validates that a string length is within a range
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): string {
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max} characters`
    );
  }
  return value;
}

/**
 * Validates that a value is a valid email format
 */
export function validateEmail(value: string, fieldName: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }
  return value;
}

/**
 * Validates that a value is a valid ISO date string
 */
export function validateISODate(value: string, fieldName: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid ISO date string`);
  }
  return value;
}

/**
 * Validates that an array has at least one item
 */
export function validateNonEmptyArray<T>(value: T[], fieldName: string): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty array`);
  }
  return value;
}

/**
 * Validates that a value is a positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): number {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
  return value;
}

