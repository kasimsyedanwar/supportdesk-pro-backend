import { z } from 'zod';

export const dashboardQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) {
        return true;
      }

      return data.from <= data.to;
    },
    {
      message: 'from date must be before or equal to to date',
      path: ['from'],
    },
  );

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
