import { body, validationResult } from 'express-validator';

// Middleware helper to execute and validate rules
export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: errors.array()[0].msg,
      success: false,
      errors: errors.array(),
    });
  };
};

export const registerValidator = validate([
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body().custom((value) => {
    const name = value.name || value.username;
    if (!name || !name.trim()) {
      throw new Error('Full name or username is required');
    }
    return true;
  }),
]);

export const loginValidator = validate([
  body().custom((value) => {
    const id = value.email || value.username || value.emailOrUsername;
    if (!id || !id.trim()) {
      throw new Error('Email or username is required');
    }
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required'),
]);
