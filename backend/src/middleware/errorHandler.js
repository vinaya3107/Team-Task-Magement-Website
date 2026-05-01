// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' });
  }
  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

module.exports = errorHandler;
