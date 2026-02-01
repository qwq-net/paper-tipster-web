import { z } from 'zod';

export const raceSchema = z.object({
  date: z.string().min(1),
  location: z.string().min(1),
  name: z.string().min(1),
  distance: z.coerce.number().min(100),
  surface: z.enum(['芝', 'ダート']),
  condition: z.enum(['良', '稍重', '重', '不良']).optional(),
  closingAt: z.string().optional().nullable(),
});

export type RaceInput = z.infer<typeof raceSchema>;
