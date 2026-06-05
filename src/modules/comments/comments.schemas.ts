import { CommentVisibility } from '@prisma/client';
import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(3000),
  visibility: z.enum(CommentVisibility).default(CommentVisibility.PUBLIC),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
