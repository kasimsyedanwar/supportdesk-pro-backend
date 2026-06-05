import multer from 'multer';
import { AppError } from '../errors/app-error';
import { env } from '../../config/env';

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

export const uploadSingleAttachment = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(400, 'Unsupported file type', 'UNSUPPORTED_FILE_TYPE', {
          allowedMimeTypes: Array.from(allowedMimeTypes),
          receivedMimeType: file.mimetype,
        }),
      );

      return;
    }

    callback(null, true);
  },
}).single('file');
