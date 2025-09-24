export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.status && err.status >= 400 && err.status < 600) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('UnhandledError', err);
  return res.status(500).json({ error: 'InternalServerError' });
}
