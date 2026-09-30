import { body } from 'express-validator';
import { validate } from './auth.validator.js';

export const createComplaintValidator = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL'),
]);

export const resolveComplaintValidator = validate([
  body('resolution')
    .trim()
    .notEmpty()
    .withMessage('Resolution details are required before resolving')
    .isLength({ min: 5 })
    .withMessage('Resolution details must be at least 5 characters long'),
]);

export const assignAgentValidator = validate([
  body('agentId')
    .notEmpty()
    .withMessage('Agent ID is required')
    .isMongoId()
    .withMessage('Invalid Agent ID format'),
]);

export const changePriorityValidator = validate([
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL'),
]);

export const addNoteValidator = validate([
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Investigation note cannot be empty')
    .isLength({ min: 3 })
    .withMessage('Note must be at least 3 characters long'),
]);

export const reopenValidator = validate([
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for reopening is required')
    .isLength({ min: 5 })
    .withMessage('Reason must be at least 5 characters long'),
]);
