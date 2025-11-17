/**
 * ID Generation Utilities
 * Provides unique ID generation for various entities
 */

import { randomUUID } from 'crypto';

/**
 * Generates a unique document ID
 */
export function generateDocumentId(): string {
  return `DOC-${randomUUID()}`;
}

/**
 * Generates a unique chunk ID
 */
export function generateChunkId(documentId: string, chunkIndex: number): string {
  return `CHUNK-${documentId}-${chunkIndex}`;
}

/**
 * Generates a unique prompt ID
 */
export function generatePromptId(): string {
  return `PROMPT-${randomUUID()}`;
}

/**
 * Generates a unique use case ID
 */
export function generateUseCaseId(): string {
  return `USECASE-${randomUUID()}`;
}

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return `REQ-${randomUUID()}`;
}

/**
 * Generates a unique output ID
 */
export function generateOutputId(): string {
  return `OUTPUT-${randomUUID()}`;
}

/**
 * Generates a DynamoDB partition key for documents
 */
export function getDocumentPK(documentId: string): string {
  return `DOCUMENT#${documentId}`;
}

/**
 * Generates a DynamoDB sort key for document metadata
 */
export function getDocumentMetadataSK(): string {
  return 'METADATA';
}

/**
 * Generates a DynamoDB partition key for user documents index
 */
export function getUserDocumentsPK(userId: string): string {
  return `USER#${userId}`;
}

/**
 * Generates a timestamp-based sort key for sorting
 */
export function getTimestampSK(timestamp: string): string {
  return timestamp;
}

