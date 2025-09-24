// Centralized error handling middleware

export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  // Joi validation errors
  if (err.isJoi) {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.details.map(d => d.message)
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: err.meta?.target || 'unknown'
    });
  }

  // Custom validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: err.message
    });
  }

  // HMAC/Auth errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error'
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
}