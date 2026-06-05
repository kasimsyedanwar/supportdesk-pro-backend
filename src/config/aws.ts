import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';
import { AppError } from '../common/errors/app-error';

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
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});
