import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { AppError } from '../common/errors/app-error';
import { env } from './env';

const hasAwsCredentials = (): boolean => {
  return Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
};

export const assertS3Configured = (): void => {
  if (
    !env.AWS_S3_BUCKET ||
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new AppError(500, 'S3 upload is not configured', 'S3_NOT_CONFIGURED');
  }
};

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: hasAwsCredentials()
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export const dynamoDbClient = new DynamoDBClient({
  region: env.AWS_REGION,
  endpoint: env.AWS_DYNAMODB_ENDPOINT || undefined,
  credentials: hasAwsCredentials()
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});
