/**
 * List Documents Lambda Handler
 * Retrieves all documents uploaded by the authenticated user with optional filtering
 */

import {
  successResponse,
  getUserId,
  getQueryParameter,
} from '../../../../utils/api-response';
import { handleError } from '../../../../utils/error-handler';
import {
  validateEnum,
  validateNumberRange,
} from '../../../../utils/validation';
import { queryDocumentsByUser } from '../../../../utils/dynamodb-utils';

interface ListDocumentsResponse {
  documents: DocumentMetadata[];
  nextCursor?: string;
  totalCount?: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const handler = async (event: {
  httpMethod: string;
  queryStringParameters?: Record<string, string> | null;
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
    const metadataTableName = process.env.METADATA_TABLE_NAME;

    if (!metadataTableName) {
      throw new Error('Missing required environment variables');
    }

    // Get user ID from Cognito
    const userId = getUserId(event);

    // Get query parameters
    const statusParam = getQueryParameter(event, 'status');
    const limitParam = getQueryParameter(event, 'limit');
    const cursor = getQueryParameter(event, 'cursor');

    // Validate and parse limit
    const limit = limitParam
      ? validateNumberRange(parseInt(limitParam, 10), 1, MAX_LIMIT, 'limit')
      : DEFAULT_LIMIT;

    // Validate status if provided
    let status: DocumentStatus | undefined;
    if (statusParam) {
      status = validateEnum(
        statusParam,
        ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'],
        'status'
      ) as DocumentStatus;
    }

    // Query documents by user
    const result = await queryDocumentsByUser<DocumentMetadataItem>(
      metadataTableName,
      userId,
      limit,
      cursor
    );

    // Filter by status if provided
    let filteredDocuments = result.items;
    if (status) {
      filteredDocuments = result.items.filter((doc) => doc.status === status);
    }

    // Transform DynamoDB items to API response format
    const documents: DocumentMetadata[] = filteredDocuments.map((item) => ({
      documentId: item.documentId,
      userId: item.userId,
      fileName: item.fileName,
      fileType: item.fileType,
      fileSize: item.fileSize,
      status: item.status,
      uploadedAt: item.uploadedAt,
      processedAt: item.processedAt,
      embeddingStatus: item.embeddingStatus,
      chunkCount: item.chunkCount,
    }));

    // Prepare response
    const response: ListDocumentsResponse = {
      documents,
      nextCursor: result.nextCursor,
    };

    return successResponse(response, 200);
  } catch (error) {
    return handleError(error);
  }
};

