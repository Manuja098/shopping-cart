export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'P2002') { statusCode = 409; message = `${err.meta?.target?.join(', ')} already exists`; }
  if (err.code === 'P2025') { statusCode = 404; message = 'Record not found'; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired. Please log in again'; }

  res.status(statusCode).json({ success: false, message });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};