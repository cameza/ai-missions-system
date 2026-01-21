import { z } from 'zod';
import { APIError } from './response';

export const TransfersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(250).default(100),
  leagues: z.array(z.string()).optional(),
  positions: z.array(z.string()).optional(),
  transferTypes: z.array(z.enum(['Loan', 'Permanent', 'Free Transfer', 'N/A'])).optional(),
  minValue: z.coerce.number().int().nonnegative().optional(),
  maxValue: z.coerce.number().int().nonnegative().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  status: z.enum(['all', 'confirmed', 'rumours']).default('all'),
  sortBy: z.enum(['transfer_date', 'transfer_value', 'player_name', 'from_club_name', 'to_club_name']).default('transfer_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SummaryQuerySchema = z.object({
  window: z.string().optional(),
});

export const TopTransfersQuerySchema = z.object({
  window: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export type TransfersQueryParams = z.infer<typeof TransfersQuerySchema>;
export type SummaryQueryParams = z.infer<typeof SummaryQuerySchema>;
export type TopTransfersQueryParams = z.infer<typeof TopTransfersQuerySchema>;

export function validateQuery<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const parsed = schema.safeParse(Object.fromEntries(params));
  
  if (!parsed.success) {
    throw new APIError(400, 'Invalid query parameters', parsed.error.issues);
  }
  
  return parsed.data;
}

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    throw new APIError(400, 'Invalid request body', parsed.error.issues);
  }
  
  return parsed.data;
}
