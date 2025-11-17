/**
 * DynamoDB Utilities
 * Provides helper functions for DynamoDB operations
 */

import { DocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DocumentClient.from(dynamoClient);

/**
 * Gets a document by ID from DynamoDB
 */
export async function getDocumentById<T>(
  tableName: string,
  documentId: string
): Promise<T | null> {
  const PK = `DOCUMENT#${documentId}`;
  const SK = 'METADATA';

  const result = await docClient.get({
    TableName: tableName,
    Key: {
      PK,
      SK,
    },
  });

  return (result.Item as T) || null;
}

/**
 * Saves a document to DynamoDB
 */
export async function saveDocument<T extends Record<string, unknown>>(
  tableName: string,
  item: T
): Promise<void> {
  await docClient.put({
    TableName: tableName,
    Item: item,
  });
}

/**
 * Updates a document in DynamoDB
 */
export async function updateDocument(
  tableName: string,
  documentId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const PK = `DOCUMENT#${documentId}`;
  const SK = 'METADATA';

  const updateExpression: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  Object.keys(updates).forEach((key, index) => {
    const nameKey = `#attr${index}`;
    const valueKey = `:val${index}`;
    updateExpression.push(`${nameKey} = ${valueKey}`);
    expressionAttributeNames[nameKey] = key;
    expressionAttributeValues[valueKey] = updates[key];
  });

  updateExpression.push('#updatedAt = :now');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':now'] = new Date().toISOString();

  await docClient.update({
    TableName: tableName,
    Key: { PK, SK },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });
}

/**
 * Queries documents by user ID using GSI
 */
export async function queryDocumentsByUser<T>(
  tableName: string,
  userId: string,
  limit?: number,
  cursor?: string
): Promise<{
  items: T[];
  nextCursor?: string;
}> {
  const PK = `USER#${userId}`;
  const startKey = cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString()) : undefined;

  const result = await docClient.query({
    TableName: tableName,
    IndexName: 'UserDocumentsIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Limit: limit,
    ExclusiveStartKey: startKey,
    ScanIndexForward: false, // Most recent first
  });

  const nextCursor = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : undefined;

  return {
    items: (result.Items as T[]) || [],
    nextCursor,
  };
}

/**
 * Deletes a document from DynamoDB
 */
export async function deleteDocument(tableName: string, documentId: string): Promise<void> {
  const PK = `DOCUMENT#${documentId}`;
  const SK = 'METADATA';

  await docClient.delete({
    TableName: tableName,
    Key: { PK, SK },
  });
}

