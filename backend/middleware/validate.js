const ApiError = require('../utils/ApiError');

/**
 * Generic body-validation middleware. `schema` maps field -> validator fn
 * (value, body) => string|null (returns an error message, or null if valid).
 * Keeps validation declarative and out of controllers/routes.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = {};
    for (const [field, validator] of Object.entries(schema)) {
      const message = validator(req.body[field], req.body);
      if (message) errors[field] = message;
    }
    if (Object.keys(errors).length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }
    next();
  };
}

const rules = {
  required: (label) => (v) => (v === undefined || v === null || v === '' ? `${label} is required` : null),
  isString: (label) => (v) => (v !== undefined && typeof v !== 'string' ? `${label} must be a string` : null),
  isNumber: (label) => (v) => (v !== undefined && typeof v !== 'number' ? `${label} must be a number` : null),
  isOneOf: (label, options) => (v) => (v !== undefined && !options.includes(v) ? `${label} must be one of ${options.join(', ')}` : null),
  isEmail: (label) => (v) => (v !== undefined && !/^\S+@\S+\.\S+$/.test(v) ? `${label} must be a valid email` : null),
  minLength: (label, len) => (v) => (v !== undefined && String(v).length < len ? `${label} must be at least ${len} characters` : null),
  combine: (...fns) => (v, body) => {
    for (const fn of fns) {
      const err = fn(v, body);
      if (err) return err;
    }
    return null;
  },
};

module.exports = { validateBody, rules };
