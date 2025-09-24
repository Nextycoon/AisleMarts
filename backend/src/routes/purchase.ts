import { Router } from "express";
import { requireHeaders, verifyHmac, idempotencyGate } from "../middleware/security.js";
import { z } from "zod";

const PurchaseSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  userId: z.string().optional(),
  referrerStoryId: z.string().optional()
});

const RefundSchema = z.object({
  purchaseId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  reason: z.string().optional(),
  userId: z.string().optional()
});

const router = Router();

// Track purchase with proper error codes
router.post(
  "/api/track/purchase",
  requireHeaders,
  verifyHmac,
  idempotencyGate,
  (req, res) => {
    const parsed = PurchaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ 
        error: "validation_failed", 
        details: parsed.error.flatten() 
      });
    }

    // Business logic would go here
    // For now, return success response
    const { orderId, productId, amount, currency } = parsed.data;
    
    return res.status(200).json({ 
      ok: true,
      orderId,
      productId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });
  }
);

// Track refund with proper error codes  
router.post(
  "/api/track/refund",
  requireHeaders,
  verifyHmac,
  idempotencyGate,
  (req, res) => {
    const parsed = RefundSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ 
        error: "validation_failed", 
        details: parsed.error.flatten() 
      });
    }

    // Business logic would go here
    const { purchaseId, amount, currency, reason } = parsed.data;
    
    return res.status(200).json({ 
      ok: true,
      purchaseId,
      amount,
      currency,
      reason,
      timestamp: new Date().toISOString()
    });
  }
);

export default router;