import { z } from 'zod';

export const createPresignedUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum([
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'text/plain',
  ]),
  sizeBytes: z.coerce.number().int().positive().max(5242880),
});

export type CreatePresignedUrlInput = z.infer<typeof createPresignedUrlSchema>;
