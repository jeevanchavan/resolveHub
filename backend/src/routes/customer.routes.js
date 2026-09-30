import express from 'express';
import {
  getMyComplaints,
  closeComplaint,
  reopenComplaint,
} from '../controllers/complaint.controller.js';
import { authUser, authorize } from '../middleware/auth.middleware.js';

const customerRouter = express.Router();

customerRouter.use(authUser, authorize('CUSTOMER'));

// Customer complaint list
customerRouter.get('/complaints', getMyComplaints);

// Customer complaint actions
customerRouter.patch('/complaints/:id/close', closeComplaint);
customerRouter.patch('/complaints/:id/reopen', reopenComplaint);

export default customerRouter;
