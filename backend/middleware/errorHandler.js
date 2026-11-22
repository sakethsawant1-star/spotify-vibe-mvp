const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log for server debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    code: statusCode,
  });
};

module.exports = errorHandler;
