import express from 'express';
import {
  getDashboardStats,
  assignComplaint,
  changePriority,
  escalateComplaint,
} from '../controllers/complaint.controller.js';
import { authUser, authorize } from '../middleware/auth.middleware.js';

const adminRouter = express.Router();

adminRouter.use(authUser, authorize('ADMIN'));

// Admin Dashboard stats
adminRouter.get('/dashboard', getDashboardStats);

// Admin complaint actions
adminRouter.patch('/complaints/:id/assign', assignComplaint);
adminRouter.patch('/complaints/:id/priority', changePriority);
adminRouter.patch('/complaints/:id/escalate', escalateComplaint);

export default adminRouter;
