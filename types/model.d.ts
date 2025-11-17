// model.d.ts - Global Type Definitions for Serverless GenAI Document Generator

export {}; // Required to make this file a module

declare global {
  // ============================================
  // Use Case Types
  // ============================================
  type UseCaseType = 'CHECKSHEET' | 'WORK_INSTRUCTIONS';

  type OutputFormat = 'XLSX' | 'DOCX';

  interface UseCase {
    useCaseId: string;
    name: string;
    type: UseCaseType;
    outputFormat: OutputFormat;
    description: string;
    createdAt: string;
    updatedAt: string;
  }

  // ============================================
  // Document Types
  // ============================================
  type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

  type DocumentType = 'PDF' | 'DOCX' | 'TXT' | 'XLSX' | 'PPTX';

  interface DocumentMetadata {
    documentId: string;
    userId: string;
    fileName: string;
    fileType: DocumentType;
    fileSize: number; // in bytes
    s3Key: string;
    s3Bucket: string;
    status: DocumentStatus;
    uploadedAt: string; // ISO timestamp
    processedAt?: string; // ISO timestamp
    errorMessage?: string;
    embeddingStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    chunkCount?: number; // Number of text chunks created
  }

  interface DocumentChunk {
    chunkId: string;
    documentId: string;
    chunkIndex: number;
    text: string;
    startCharIndex: number;
    endCharIndex: number;
    embedding?: number[]; // Vector embedding
    metadata?: Record<string, unknown>;
  }

  // ============================================
  // DynamoDB Item Types
  // ============================================
  interface DocumentMetadataItem {
    PK: string; // e.g., "DOCUMENT#<documentId>"
    SK: string; // e.g., "METADATA"
    documentId: string;
    userId: string;
    fileName: string;
    fileType: DocumentType;
    fileSize: number;
    s3Key: string;
    s3Bucket: string;
    status: DocumentStatus;
    uploadedAt: string;
    processedAt?: string;
    errorMessage?: string;
    embeddingStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    chunkCount?: number;
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
  }

  // ============================================
  // Prompt Management Types (Neptune Graph)
  // ============================================
  interface PromptTemplate {
    promptId: string;
    useCaseId: string;
    useCaseType: UseCaseType;
    promptText: string;
    systemPrompt?: string;
    parameters?: Record<string, string>; // Template parameters
    version: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  }

  interface PromptGraphNode {
    id: string; // Vertex ID in Neptune
    label: 'UseCase' | 'Prompt' | 'Version';
    properties: {
      useCaseId?: string;
      useCaseType?: UseCaseType;
      promptId?: string;
      promptText?: string;
      systemPrompt?: string;
      version?: number;
      isActive?: boolean;
      createdAt?: string;
      updatedAt?: string;
    };
  }

  interface PromptGraphEdge {
    id: string; // Edge ID in Neptune
    label: 'HAS_PROMPT' | 'HAS_VERSION' | 'CURRENT_VERSION';
    from: string; // Source vertex ID
    to: string; // Target vertex ID
    properties?: Record<string, unknown>;
  }

  // ============================================
  // Query & Retrieval Types
  // ============================================
  interface RetrievalQuery {
    documentIds: string[];
    useCaseId: string;
    query?: string; // Optional user query for RAG
    maxChunks?: number; // Max number of chunks to retrieve
    similarityThreshold?: number; // Minimum similarity score (0-1)
  }

  interface RetrievedChunk {
    chunkId: string;
    documentId: string;
    text: string;
    similarityScore: number;
    metadata: {
      fileName: string;
      chunkIndex: number;
      [key: string]: unknown;
    };
  }

  interface GenerationRequest {
    requestId: string;
    userId: string;
    useCaseId: string;
    documentIds: string[];
    retrievedChunks: RetrievedChunk[];
    promptTemplate: PromptTemplate;
    additionalContext?: Record<string, unknown>;
  }

  interface LLMResponse {
    content: string;
    model: string; // e.g., "claude-3-sonnet", "gemini-pro"
    tokensUsed?: number;
    finishReason?: string;
    metadata?: Record<string, unknown>;
  }

  // ============================================
  // Output Formatter Types
  // ============================================
  interface ChecksheetData {
    title: string;
    equipmentName?: string;
    inspectionDate?: string;
    inspectorName?: string;
    items: ChecksheetItem[];
    notes?: string;
  }

  interface ChecksheetItem {
    itemNumber: number;
    description: string;
    status: 'OK' | 'NOT_OK' | 'N/A';
    remarks?: string;
    category?: string;
  }

  interface WorkInstructionData {
    title: string;
    equipmentName?: string;
    procedureNumber?: string;
    revisionDate?: string;
    sections: WorkInstructionSection[];
    safetyNotes?: string[];
    toolsRequired?: string[];
  }

  interface WorkInstructionSection {
    sectionNumber: number;
    sectionTitle: string;
    steps: WorkInstructionStep[];
  }

  interface WorkInstructionStep {
    stepNumber: number;
    description: string;
    expectedResult?: string;
    warnings?: string[];
    images?: string[]; // S3 URLs
  }

  interface FormattedOutput {
    outputId: string;
    requestId: string;
    userId: string;
    useCaseId: string;
    format: OutputFormat;
    s3Key: string;
    s3Bucket: string;
    fileSize: number;
    createdAt: string;
    expiresAt: string; // Pre-signed URL expiration
    downloadUrl?: string; // Pre-signed URL
  }

  // ============================================
  // API Request/Response Types
  // ============================================
  interface UploadDocumentRequest {
    fileName: string;
    fileType: DocumentType;
    fileSize: number;
  }

  interface UploadDocumentResponse {
    documentId: string;
    uploadUrl: string; // Pre-signed S3 URL
    expiresIn: number; // Seconds until URL expires
  }

  interface GenerateDocumentRequest {
    documentIds: string[];
    useCaseId: string;
    query?: string; // Optional query for RAG
  }

  interface GenerateDocumentResponse {
    requestId: string;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    outputId?: string;
    downloadUrl?: string;
    errorMessage?: string;
  }

  interface GetPromptRequest {
    useCaseId: string;
  }

  interface GetPromptResponse {
    promptId: string;
    useCaseId: string;
    promptText: string;
    systemPrompt?: string;
    version: number;
  }

  interface CreatePromptRequest {
    useCaseId: string;
    useCaseType: UseCaseType;
    promptText: string;
    systemPrompt?: string;
    parameters?: Record<string, string>;
  }

  interface CreatePromptResponse {
    promptId: string;
    useCaseId: string;
    version: number;
    message: string;
  }

  interface ListDocumentsRequest {
    userId: string;
    status?: DocumentStatus;
    limit?: number;
    cursor?: string; // For pagination
  }

  interface ListDocumentsResponse {
    documents: DocumentMetadata[];
    nextCursor?: string;
    totalCount?: number;
  }

  interface GetDocumentStatusRequest {
    documentId: string;
  }

  interface GetDocumentStatusResponse {
    documentId: string;
    status: DocumentStatus;
    embeddingStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    chunkCount?: number;
    errorMessage?: string;
  }

  // ============================================
  // OpenSearch Types
  // ============================================
  interface OpenSearchDocument {
    chunkId: string;
    documentId: string;
    text: string;
    embedding: number[]; // Vector embedding
    metadata: {
      fileName: string;
      chunkIndex: number;
      uploadedAt: string;
      userId: string;
      [key: string]: unknown;
    };
  }

  interface VectorSearchRequest {
    queryVector: number[];
    documentIds?: string[];
    topK: number;
    minScore?: number;
  }

  interface VectorSearchResult {
    chunkId: string;
    documentId: string;
    text: string;
    score: number;
    metadata: Record<string, unknown>;
  }

  // ============================================
  // Error Types
  // ============================================
  interface ApiError {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;
  }

  // ============================================
  // S3 Types
  // ============================================
  interface S3EventRecord {
    s3: {
      bucket: {
        name: string;
      };
      object: {
        key: string;
        size: number;
      };
    };
  }

  interface S3Event {
    Records: S3EventRecord[];
  }

  // ============================================
  // Lambda Event Types
  // ============================================
  interface APIGatewayProxyEvent {
    httpMethod: string;
    path: string;
    pathParameters?: Record<string, string>;
    queryStringParameters?: Record<string, string>;
    headers?: Record<string, string>;
    body?: string;
    requestContext: {
      requestId: string;
      identity: {
        cognitoIdentityId?: string;
        userArn?: string;
      };
    };
  }

  interface APIGatewayProxyResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body: string;
  }

  // ============================================
  // Environment Variables Types
  // ============================================
  interface LambdaEnvironment {
    DOCUMENTS_BUCKET_NAME: string;
    OUTPUT_BUCKET_NAME: string;
    METADATA_TABLE_NAME: string;
    OPENSEARCH_DOMAIN_ENDPOINT: string;
    NEPTUNE_CLUSTER_ENDPOINT: string;
    BEDROCK_MODEL_ID?: string; // e.g., "anthropic.claude-3-sonnet-20240229-v1:0"
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    ALLOWED_ORIGIN: string;
    AWS_REGION: string;
  }

  // ============================================
  // Utility Types
  // ============================================
  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

  interface PaginationParams {
    limit?: number;
    cursor?: string;
  }

  interface PaginatedResponse<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
  }
}

