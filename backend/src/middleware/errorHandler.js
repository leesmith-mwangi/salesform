// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL error codes
  const pgErrorMessages = {
    '23505': 'Duplicate entry. This record already exists.',
    '23503': 'Referenced record not found. Check foreign key constraints.',
    '23502': 'Required field is missing.',
    '22P02': 'Invalid input format.',
    '23514': 'Check constraint violation.',
    '42P01': 'Table does not exist. Database may not be set up correctly.'
  };

  // Handle PostgreSQL errors
  if (err.code && pgErrorMessages[err.code]) {
    return res.status(400).json({
      success: false,
      error: pgErrorMessages[err.code],
      detail: err.detail || err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
