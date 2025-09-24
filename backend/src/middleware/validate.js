import Joi from 'joi';

// Zod-style validation schemas using Joi
export const schemas = {
  impression: Joi.object({
    storyId: Joi.string().min(1).required(),
    userId: Joi.string().min(1).optional()
  }),

  cta: Joi.object({
    storyId: Joi.string().min(1).required(),
    productId: Joi.string().min(1).optional(),
    userId: Joi.string().min(1).optional()
  }),

  purchase: Joi.object({
    orderId: Joi.string().min(1).required(),
    userId: Joi.string().min(1).optional(),
    productId: Joi.string().min(1).required(),
    amount: Joi.number().positive().max(1000000).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY').required(),
    referrerStoryId: Joi.string().min(1).optional()
  }),

  refund: Joi.object({
    purchaseId: Joi.string().min(1).required(),
    amount: Joi.number().positive().max(1000000).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY').required(),
    reason: Joi.string().min(1).required(),
    userId: Joi.string().min(1).optional()
  })
};

export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(422).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
}