import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env';
import { assertS3Configured, s3Client } from '../../config/aws';
import { CreatePresignedUrlInput } from './attachments.schemas';

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const createAttachmentPresignedUrl = async (data: {
  ticketId: string;
  input: CreatePresignedUrlInput;
}): Promise<{
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}> => {
  assertS3Configured();

  const safeFileName = sanitizeFileName(data.input.fileName);
  const storageKey = `tickets/${data.ticketId}/${crypto.randomUUID()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: storageKey,
    ContentType: data.input.mimeType,
    ContentLength: data.input.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: env.S3_PRESIGNED_URL_EXPIRES_IN_SECONDS,
  });

  return {
    uploadUrl,
    storageKey,
    expiresInSeconds: env.S3_PRESIGNED_URL_EXPIRES_IN_SECONDS,
  };
};
