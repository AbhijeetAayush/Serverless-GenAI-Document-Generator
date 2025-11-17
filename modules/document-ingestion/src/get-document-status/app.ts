/**
 * Get Document Status Lambda Handler
 * Retrieves the processing status of a specific document
 */

import {
  successResponse,
  getPathParameter,
  getUserId,
} from '../../../../utils/api-response';
import { handleError, NotFoundError } from '../../../../utils/error-handler';
import { getDocumentById } from '../../../../utils/dynamodb-utils';

interface GetDocumentStatusResponse {
  documentId: string;
  status: DocumentStatus;
  embeddingStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  chunkCount?: number;
  errorMessage?: string;
}

export const handler = async (event: {
  httpMethod: string;
  pathParameters?: Record<string, string> | null;
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

    // Get document ID from path parameters
    const documentId = getPathParameter(event, 'documentId');

    // Get document from DynamoDB
    const document = await getDocumentById<DocumentMetadataItem>(
      metadataTableName,
      documentId
    );

    if (!document) {
      throw new NotFoundError('Document', documentId);
    }

    // Verify document belongs to the user
    if (document.userId !== userId) {
      throw new NotFoundError('Document', documentId);
    }

    // Prepare response
    const response: GetDocumentStatusResponse = {
      documentId: document.documentId,
      status: document.status,
      embeddingStatus: document.embeddingStatus,
      chunkCount: document.chunkCount,
      errorMessage: document.errorMessage,
    };

    return successResponse(response, 200);
  } catch (error) {
    return handleError(error);
  }
};

