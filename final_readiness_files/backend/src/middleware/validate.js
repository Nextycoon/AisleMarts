import { ZodError } from 'zod';
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
};
