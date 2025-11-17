/**
 * Upload Document Lambda Handler
 * Generates pre-signed S3 URL for document upload and creates document metadata
 */

import {
  successResponse,
  parseBody,
  getUserId,
} from '../../../../utils/api-response';
import { ValidationError, handleError } from '../../../../utils/error-handler';
import {
  validateRequired,
  validateEnum,
  validateNumberRange,
} from '../../../../utils/validation';
import {
  generateDocumentId,
  getDocumentPK,
  getDocumentMetadataSK,
} from '../../../../utils/id-generator';
import { getCurrentTimestamp } from '../../../../utils/date-utils';
import {
  generateUploadUrl,
  generateDocumentS3Key,
  isValidDocumentType,
} from '../../../../utils/s3-utils';
import { saveDocument } from '../../../../utils/dynamodb-utils';

interface UploadDocumentRequest {
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'XLSX' | 'PPTX';
  fileSize: number;
}

interface UploadDocumentResponse {
  documentId: string;
  uploadUrl: string;
  expiresIn: number;
}

const EXPIRES_IN_SECONDS = 3600; // 1 hour
const MAX_FILE_SIZE = 10485760; // 10MB

export const handler = async (event: {
  httpMethod: string;
  body: string | null | undefined;
  requestContext?: {
    identity?: {
      cognitoIdentityId?: string;
    };
  };
}): Promise<{
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}> => {
  try {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    // Get environment variables
    const documentsBucket = process.env.DOCUMENTS_BUCKET_NAME;
    const metadataTableName = process.env.METADATA_TABLE_NAME;

    if (!documentsBucket || !metadataTableName) {
      throw new Error('Missing required environment variables');
    }

    // Get user ID from Cognito
    const userId = getUserId(event);

    // Parse and validate request body
    const body = parseBody<UploadDocumentRequest>(event.body);

    // Validate required fields
    const fileName = validateRequired(body.fileName, 'fileName');
    const fileType = validateEnum(
      body.fileType,
      ['PDF', 'DOCX', 'TXT', 'XLSX', 'PPTX'],
      'fileType'
    );
    const fileSize = validateNumberRange(
      body.fileSize,
      1,
      MAX_FILE_SIZE,
      'fileSize'
    );

    // Validate file type
    if (!isValidDocumentType(fileName)) {
      throw new ValidationError(
        `Invalid file type. Supported types: PDF, DOCX, TXT, XLSX, PPTX`
      );
    }

    // Generate document ID
    const documentId = generateDocumentId();
    const timestamp = getCurrentTimestamp();

    // Generate S3 key
    const s3Key = generateDocumentS3Key(userId, documentId, fileName);

    // Generate pre-signed upload URL
    const uploadUrl = await generateUploadUrl(
      documentsBucket,
      s3Key,
      EXPIRES_IN_SECONDS,
      `application/${fileType.toLowerCase()}`
    );

    // Create document metadata item
    const documentMetadata: DocumentMetadataItem & Record<string, unknown> = {
      PK: getDocumentPK(documentId),
      SK: getDocumentMetadataSK(),
      documentId,
      userId,
      fileName,
      fileType,
      fileSize,
      s3Key,
      s3Bucket: documentsBucket,
      status: 'UPLOADED',
      uploadedAt: timestamp,
      embeddingStatus: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save document metadata to DynamoDB
    await saveDocument(metadataTableName, documentMetadata);

    // Prepare response
    const response: UploadDocumentResponse = {
      documentId,
      uploadUrl,
      expiresIn: EXPIRES_IN_SECONDS,
    };

    return successResponse(response, 200);
  } catch (error) {
    return handleError(error);
  }
};

