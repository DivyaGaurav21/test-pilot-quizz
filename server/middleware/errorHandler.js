const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    err.expose || status < 500
      ? err.message || 'Request failed'
      : 'Internal server error';

  const payload = { message };
  if (!isProduction && status >= 500) {
    payload.error = err.message;
  }

  return res.status(status).json(payload);
};

const notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

module.exports = { errorHandler, notFound };
