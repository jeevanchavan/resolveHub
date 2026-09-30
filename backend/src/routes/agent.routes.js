import express from 'express';
import {
  getAllComplaints,
  startComplaint,
  addInvestigationNote,
  resolveComplaint,
  escalateComplaint,
} from '../controllers/complaint.controller.js';
import { authUser, authorize } from '../middleware/auth.middleware.js';

const agentRouter = express.Router();

agentRouter.use(authUser, authorize('AGENT', 'ADMIN'));

// Agent complaint list
agentRouter.get('/complaints', getAllComplaints);

// Agent complaint actions
agentRouter.patch('/complaints/:id/start', startComplaint);
agentRouter.post('/complaints/:id/notes', addInvestigationNote);
agentRouter.patch('/complaints/:id/resolve', resolveComplaint);
agentRouter.patch('/complaints/:id/escalate', escalateComplaint);

export default agentRouter;
