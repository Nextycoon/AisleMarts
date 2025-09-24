// Zod validation schemas for API requests
import Joi from 'joi';

export const ImpressionSchema = Joi.object({
  storyId: Joi.string().min(1).required().messages({
    'string.empty': 'Story ID is required',
    'any.required': 'Story ID is required'
  }),
  userId: Joi.string().min(1).optional()
});

export const CTASchema = Joi.object({
  storyId: Joi.string().min(1).required().messages({
    'string.empty': 'Story ID is required', 
    'any.required': 'Story ID is required'
  }),
  productId: Joi.string().min(1).optional(),
  userId: Joi.string().min(1).optional()
});

export const PurchaseSchema = Joi.object({
  orderId: Joi.string().min(1).required().messages({
    'string.empty': 'Order ID is required',
    'any.required': 'Order ID is required'
  }),
  userId: Joi.string().min(1).optional(),
  productId: Joi.string().min(1).required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required'  
  }),
  amount: Joi.number().positive().max(1000000).required().messages({
    'number.positive': 'Amount must be positive',
    'number.max': 'Amount must be <= 1,000,000',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY').required().messages({
    'any.only': 'Currency must be USD, EUR, GBP, or JPY',
    'any.required': 'Currency is required'
  }),
  referrerStoryId: Joi.string().min(1).optional()
});

export const RefundSchema = Joi.object({
  purchaseId: Joi.string().min(1).required().messages({
    'string.empty': 'Purchase ID is required',
    'any.required': 'Purchase ID is required'
  }),
  amount: Joi.number().positive().max(1000000).required().messages({
    'number.positive': 'Amount must be positive', 
    'number.max': 'Amount must be <= 1,000,000',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY').required().messages({
    'any.only': 'Currency must be USD, EUR, GBP, or JPY',
    'any.required': 'Currency is required'
  }),
  reason: Joi.string().min(1).required().messages({
    'string.empty': 'Reason is required',
    'any.required': 'Reason is required'
  }),
  userId: Joi.string().min(1).optional()
});