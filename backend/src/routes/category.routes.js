import express from 'express';
import { getCategories } from '../controllers/category.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const categoryRouter = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all active categories (authenticated)
 */
categoryRouter.get('/', authUser, getCategories);

export default categoryRouter;
