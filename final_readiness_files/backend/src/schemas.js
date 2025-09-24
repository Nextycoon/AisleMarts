import { z } from 'zod';
export const Currency = z.enum(['USD','EUR','GBP','JPY']);
const amount = z.number().finite().positive().max(1000000);

export const ImpressionSchema = z.object({
  storyId: z.string().min(1),
  userId:  z.string().min(1).optional(),
});

export const CTASchema = z.object({
  storyId:   z.string().min(1),
  productId: z.string().min(1).optional(),
  userId:    z.string().min(1).optional(),
});

export const PurchaseSchema = z.object({
  orderId:          z.string().min(1),
  userId:           z.string().min(1).optional(),
  productId:        z.string().min(1),
  amount,
  currency:         Currency,
  referrerStoryId:  z.string().min(1).optional(),
});
