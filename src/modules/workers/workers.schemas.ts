import { z } from 'zod';

export const processNotificationsSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type ProcessNotificationsInput = z.infer<
  typeof processNotificationsSchema
>;
