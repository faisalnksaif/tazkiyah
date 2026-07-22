// Wraps an async route handler so rejected promises reach errorHandler
// without repeating try/catch in every controller method.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
