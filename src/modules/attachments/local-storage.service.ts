import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const saveAttachmentLocally = async (data: {
  ticketId: string;
  originalName: string;
  buffer: Buffer;
}): Promise<{
  storageKey: string;
  fileName: string;
}> => {
  const safeFileName = sanitizeFileName(data.originalName);
  const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}`;

  const relativeDir = path.join('tickets', data.ticketId);
  const absoluteDir = path.join(process.cwd(), env.UPLOAD_DIR, relativeDir);

  await fs.mkdir(absoluteDir, { recursive: true });

  const relativeStorageKey = path.join(relativeDir, uniqueFileName);
  const absoluteFilePath = path.join(
    process.cwd(),
    env.UPLOAD_DIR,
    relativeStorageKey,
  );

  await fs.writeFile(absoluteFilePath, data.buffer);

  return {
    storageKey: relativeStorageKey.replace(/\\/g, '/'),
    fileName: safeFileName,
  };
};
