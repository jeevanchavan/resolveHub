/**
 * @desc 404 Not Found Handler
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });
};

/**
 * @desc Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.statusCode) statusCode = err.statusCode;
  if (err.name === 'ValidationError') statusCode = 400;
  if (err.name === 'CastError') statusCode = 404;

  let message = err.message || 'Internal Server Error';
  if (err.name === 'CastError') {
    message = 'Resource not found: Invalid ID format';
  }

  res.status(statusCode).json({
    message,
    success: false,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
