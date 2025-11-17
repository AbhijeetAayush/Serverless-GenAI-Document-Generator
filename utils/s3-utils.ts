/**
 * S3 Utilities
 * Provides S3 operations including pre-signed URLs
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});

/**
 * Generates a pre-signed URL for uploading to S3
 */
export async function generateUploadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600, // 1 hour default
  contentType?: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generates a pre-signed URL for downloading from S3
 */
export async function generateDownloadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Checks if an object exists in S3
 */
export async function objectExists(bucket: string, key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if (error instanceof Error && 'name' in error && error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Generates an S3 key for document uploads
 */
export function generateDocumentS3Key(userId: string, documentId: string, fileName: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `documents/${userId}/${timestamp}/${documentId}/${sanitizedFileName}`;
}

/**
 * Generates an S3 key for output files
 */
export function generateOutputS3Key(
  userId: string,
  outputId: string,
  format: 'XLSX' | 'DOCX'
): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const extension = format.toLowerCase();
  return `outputs/${userId}/${timestamp}/${outputId}.${extension}`;
}

/**
 * Extracts file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Validates file type based on extension
 */
export function isValidDocumentType(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  const validTypes = ['pdf', 'docx', 'txt', 'xlsx', 'pptx'];
  return validTypes.includes(extension);
}

