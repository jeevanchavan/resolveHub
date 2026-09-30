import {
  createComplaintValidator,
  resolveComplaintValidator,
  assignAgentValidator,
  changePriorityValidator,
  addNoteValidator,
  reopenValidator,
} from '../validators/complaint.validator.js';
import express from 'express';
import {
  createComplaint,
  getDashboardStats,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  changePriority,
  startComplaint,
  addInvestigationNote,
  resolveComplaint,
  escalateComplaint,
  closeComplaint,
  reopenComplaint,
  getComplaintHistory,
} from '../controllers/complaint.controller.js';
import { authUser, authorize } from '../middleware/auth.middleware.js';

const complaintRouter = express.Router();

// All complaint routes require authentication
complaintRouter.use(authUser);

/**
 * @route   GET /api/complaints/stats
 * @desc    Get dashboard metrics & counters (role-scoped)
 */
complaintRouter.get('/stats', getDashboardStats);
complaintRouter.get('/dashboard-stats', getDashboardStats);

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint (CUSTOMER)
 */
complaintRouter.post('/', authorize('CUSTOMER'), createComplaintValidator, createComplaint);

/**
 * @route   GET /api/complaints/my
 * @desc    Get logged-in customer's complaints
 */
complaintRouter.get('/my', authorize('CUSTOMER'), getMyComplaints);

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (ADMIN/AGENT)
 */
complaintRouter.get('/', authorize('ADMIN', 'AGENT'), getAllComplaints);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get a single complaint by ID
 */
complaintRouter.get('/:id', getComplaintById);

/**
 * @route   GET /api/complaints/:id/history
 * @desc    Get audit history for a complaint
 */
complaintRouter.get('/:id/history', getComplaintHistory);

/**
 * @route   PATCH /api/complaints/:id/assign
 * @desc    Assign an agent to complaint (ADMIN only)
 */
complaintRouter.patch('/:id/assign', authorize('ADMIN'), assignAgentValidator, assignComplaint);

/**
 * @route   PATCH /api/complaints/:id/priority
 * @desc    Change complaint priority (ADMIN only)
 */
complaintRouter.patch('/:id/priority', authorize('ADMIN'), changePriorityValidator, changePriority);

/**
 * @route   PATCH /api/complaints/:id/start
 * @desc    Start investigation (ASSIGNED/REOPENED -> IN_PROGRESS) (AGENT/ADMIN)
 */
complaintRouter.patch('/:id/start', authorize('AGENT', 'ADMIN'), startComplaint);

/**
 * @route   POST /api/complaints/:id/notes
 * @desc    Add investigation note (AGENT/ADMIN)
 */
complaintRouter.post('/:id/notes', authorize('AGENT', 'ADMIN'), addNoteValidator, addInvestigationNote);

/**
 * @route   PATCH /api/complaints/:id/resolve
 * @desc    Resolve complaint with resolution text (AGENT/ADMIN)
 */
complaintRouter.patch('/:id/resolve', authorize('AGENT', 'ADMIN'), resolveComplaintValidator, resolveComplaint);

/**
 * @route   PATCH /api/complaints/:id/escalate
 * @desc    Escalate complaint (AGENT/ADMIN)
 */
complaintRouter.patch('/:id/escalate', authorize('AGENT', 'ADMIN'), escalateComplaint);

/**
 * @route   PATCH /api/complaints/:id/close
 * @desc    Close complaint (RESOLVED -> CLOSED) (CUSTOMER/ADMIN)
 */
complaintRouter.patch('/:id/close', authorize('CUSTOMER', 'ADMIN'), closeComplaint);

/**
 * @route   PATCH /api/complaints/:id/reopen
 * @desc    Reopen complaint (RESOLVED -> REOPENED) (CUSTOMER)
 */
complaintRouter.patch('/:id/reopen', authorize('CUSTOMER'), reopenValidator, reopenComplaint);

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update complaint (Role-aware update fallback)
 */
complaintRouter.put('/:id', authorize('ADMIN', 'AGENT', 'CUSTOMER'), updateComplaint);

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a complaint (ADMIN only)
 */
complaintRouter.delete('/:id', authorize('ADMIN'), deleteComplaint);

export default complaintRouter;
