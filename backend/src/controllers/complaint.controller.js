import mongoose from 'mongoose';
import Complaint from '../models/complaint.model.js';
import ComplaintHistory from '../models/complaint.history.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Create a new complaint (CUSTOMER only)
 * @route   POST /api/complaints
 */
export const createComplaint = async (req, res) => {
  try {
    const { title, description, categoryId, priority } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      categoryId,
      priority: priority || 'MEDIUM',
      customerId: req.user.id,
    });

    // Record creation history
    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'CREATED',
      newStatus: 'OPEN',
      performedBy: req.user.id,
      comment: 'Complaint created',
    });

    // Populate and return
    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name');

    return res.status(201).json({
      message: 'Complaint created successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create complaint',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get complaints for the logged-in customer
 * @route   GET /api/complaints/my
 */
export const getMyComplaints = async (req, res) => {
  try {
    const {
      status,
      priority,
      categoryId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { customerId: req.user.id };

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }
    if (priority && priority !== 'ALL') {
      filter.priority = priority.toUpperCase();
    }
    if (categoryId && categoryId !== 'ALL') {
      filter.categoryId = categoryId;
    }

    // Search by title, complaintId, or description
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { complaintId: { $regex: term, $options: 'i' } },
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('categoryId', 'name')
        .populate('assignedAgentId', 'name email username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: 'Complaints fetched successfully',
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch complaints',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single complaint by ID with RBAC
 * @route   GET /api/complaints/:id
 */
export const getComplaintById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }
    const complaint = await Complaint.findById(req.params.id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    // Role-based authorization checks:
    // 1. CUSTOMER: can ONLY view their own complaint
    if (user.role === 'CUSTOMER') {
      const customerId = complaint.customerId?._id?.toString() || complaint.customerId?.toString();
      if (customerId !== req.user.id) {
        return res.status(403).json({
          message: 'Access denied: You can only view your own complaints',
          success: false,
        });
      }
    }

    // 2. AGENT: can ONLY view complaints assigned to them
    if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({
          message: 'Access denied: You can only view complaints assigned to you',
          success: false,
        });
      }
    }

    // 3. ADMIN: can view all complaints

    // Get complaint history
    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .populate('performedBy', 'name email username role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Complaint fetched successfully',
      success: true,
      complaint,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch complaint',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get all complaints (ADMIN/AGENT with RBAC scoping)
 * @route   GET /api/complaints
 */
export const getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      priority,
      categoryId,
      assignedAgentId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }
    if (priority && priority !== 'ALL') {
      filter.priority = priority.toUpperCase();
    }
    if (categoryId && categoryId !== 'ALL') {
      filter.categoryId = categoryId;
    }

    // Agent scoping vs Admin agent filtering
    if (user.role === 'AGENT') {
      filter.assignedAgentId = req.user.id;
    } else if (user.role === 'ADMIN') {
      if (assignedAgentId === 'UNASSIGNED') {
        filter.assignedAgentId = null;
      } else if (assignedAgentId && assignedAgentId !== 'ALL') {
        filter.assignedAgentId = assignedAgentId;
      }
    }

    // Search by title, complaintId, description, or customer name/email
    if (search && search.trim()) {
      const term = search.trim();
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { username: { $regex: term, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { complaintId: { $regex: term, $options: 'i' } },
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { customerId: { $in: userIds } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('customerId', 'name email username')
        .populate('categoryId', 'name')
        .populate('assignedAgentId', 'name email username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: 'Complaints fetched successfully',
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch complaints',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Update complaint (Role-aware update)
 * @route   PUT /api/complaints/:id
 */
export const updateComplaint = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }

    // Role-specific authorization checks:
    if (user.role === 'CUSTOMER') {
      const customerId = complaint.customerId?._id?.toString() || complaint.customerId?.toString();
      if (customerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied', success: false });
      }
      // Customer can ONLY close or reopen
      const { status } = req.body;
      if (status && !['CLOSED', 'REOPENED'].includes(status)) {
        return res.status(403).json({ message: 'Customers can only close or reopen complaints', success: false });
      }
    } else if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'Agents can only update complaints assigned to them', success: false });
      }
      if (req.body.assignedAgentId !== undefined) {
        return res.status(403).json({ message: 'Only ADMIN can reassign complaints', success: false });
      }
    }

    const { status, priority, assignedAgentId, resolution, note } = req.body;
    const previousStatus = complaint.status;

    if (status) complaint.status = status;
    if (priority && user.role === 'ADMIN') complaint.priority = priority;
    if (assignedAgentId !== undefined && user.role === 'ADMIN') complaint.assignedAgentId = assignedAgentId;
    if (resolution) complaint.resolution = resolution;

    // Track resolved/closed timestamps
    if (status === 'RESOLVED' && previousStatus !== 'RESOLVED') {
      complaint.resolvedAt = new Date();
    }
    if (status === 'CLOSED' && previousStatus !== 'CLOSED') {
      complaint.closedAt = new Date();
    }

    // Add investigation note
    if (note) {
      complaint.investigationNotes.push({
        note,
        addedBy: req.user.id,
      });
    }

    await complaint.save();

    // Record status change in history
    if (status && status !== previousStatus) {
      await ComplaintHistory.create({
        complaintId: complaint._id,
        action: 'STATUS_CHANGED',
        previousStatus,
        newStatus: status,
        performedBy: req.user.id,
        comment: note || ('Status changed from ' + previousStatus + ' to ' + status),
      });
    }

    // Record assignment in history
    if (assignedAgentId && user.role === 'ADMIN') {
      const agent = await User.findById(assignedAgentId);
      await ComplaintHistory.create({
        complaintId: complaint._id,
        action: 'ASSIGNED',
        performedBy: req.user.id,
        comment: 'Assigned to ' + (agent?.name || 'agent'),
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint updated successfully',
      success: true,
      complaint: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update complaint',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a complaint (ADMIN only)
 * @route   DELETE /api/complaints/:id
 */
export const deleteComplaint = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only ADMIN can delete complaints',
        success: false,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }

    await ComplaintHistory.deleteMany({ complaintId: complaint._id });
    await Complaint.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Complaint deleted successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete complaint',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Assign an agent to complaint (ADMIN only)
 * @route   PATCH /api/complaints/:id/assign
 */
export const assignComplaint = async (req, res) => {
  try {
    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({
        message: 'Agent ID is required',
        success: false,
      });
    }

    const [complaint, agent] = await Promise.all([
      Complaint.findById(req.params.id),
      User.findOne({ _id: agentId, role: 'AGENT', isActive: true }),
    ]);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }

    if (!agent) {
      return res.status(400).json({
        message: 'Selected agent is invalid or inactive',
        success: false,
      });
    }

    const previousStatus = complaint.status;
    const previousAgentId = complaint.assignedAgentId;

    complaint.assignedAgentId = agent._id;
    // Rule: OPEN -> ASSIGNED upon assignment
    if (complaint.status === 'OPEN') {
      complaint.status = 'ASSIGNED';
    }

    await complaint.save();

    // Create ComplaintHistory audit record
    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'ASSIGNED',
      previousStatus,
      newStatus: complaint.status,
      performedBy: req.user.id,
      comment: previousAgentId
        ? `Reassigned complaint to Agent: ${agent.name}`
        : `Assigned complaint to Agent: ${agent.name}`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: `Complaint assigned to ${agent.name} successfully`,
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to assign complaint',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Change complaint priority (ADMIN only)
 * @route   PATCH /api/complaints/:id/priority
 */
export const changePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      return res.status(400).json({
        message: 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL',
        success: false,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }

    const previousPriority = complaint.priority;
    complaint.priority = priority;
    await complaint.save();

    // Audit record
    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'PRIORITY_CHANGED',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      performedBy: req.user.id,
      comment: `Priority changed from ${previousPriority} to ${priority}`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email');

    return res.status(200).json({
      message: `Priority updated to ${priority}`,
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to change priority',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Start investigation on complaint (ASSIGNED/REOPENED/ESCALATED -> IN_PROGRESS)
 * @route   PATCH /api/complaints/:id/start
 */
export const startComplaint = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    // Role check: Only assigned agent or admin
    if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'You can only start complaints assigned to you', success: false });
      }
    }

    if (complaint.status === 'CLOSED') {
      return res.status(400).json({ message: 'Closed complaints cannot be modified', success: false });
    }

    if (complaint.status === 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Complaint is already in progress', success: false });
    }

    const previousStatus = complaint.status;
    complaint.status = 'IN_PROGRESS';
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'STATUS_CHANGED',
      previousStatus,
      newStatus: 'IN_PROGRESS',
      performedBy: req.user.id,
      comment: `Investigation started by ${user.name || user.username}`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint moved to IN_PROGRESS',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to start complaint', success: false, error: error.message });
  }
};

/**
 * @desc    Add investigation note to complaint
 * @route   POST /api/complaints/:id/notes
 */
export const addInvestigationNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'Note text is required', success: false });
    }

    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'You can only add notes to complaints assigned to you', success: false });
      }
    }

    if (complaint.status === 'CLOSED') {
      return res.status(400).json({ message: 'Cannot add notes to closed complaints', success: false });
    }

    complaint.investigationNotes.push({
      note: note.trim(),
      addedBy: req.user.id,
      addedAt: new Date(),
    });
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'NOTE_ADDED',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      performedBy: req.user.id,
      comment: `Note added: "${note.trim()}"`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Investigation note added successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add note', success: false, error: error.message });
  }
};

/**
 * @desc    Resolve complaint (IN_PROGRESS -> RESOLVED with mandatory resolution text)
 * @route   PATCH /api/complaints/:id/resolve
 */
export const resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    if (!resolution || resolution.trim() === '') {
      return res.status(400).json({ message: 'Resolution details are required to resolve a complaint', success: false });
    }

    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'You can only resolve complaints assigned to you', success: false });
      }
    }

    if (complaint.status === 'CLOSED') {
      return res.status(400).json({ message: 'Complaint is already closed', success: false });
    }

    const previousStatus = complaint.status;
    complaint.status = 'RESOLVED';
    complaint.resolution = resolution.trim();
    complaint.resolvedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'STATUS_CHANGED',
      previousStatus,
      newStatus: 'RESOLVED',
      performedBy: req.user.id,
      comment: `Resolution: "${resolution.trim()}"`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint resolved successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to resolve complaint', success: false, error: error.message });
  }
};

/**
 * @desc    Escalate complaint (IN_PROGRESS -> ESCALATED)
 * @route   PATCH /api/complaints/:id/escalate
 */
export const escalateComplaint = async (req, res) => {
  try {
    const { note } = req.body;
    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'You can only escalate complaints assigned to you', success: false });
      }
    }

    if (['CLOSED', 'RESOLVED'].includes(complaint.status)) {
      return res.status(400).json({ message: 'Cannot escalate a closed or resolved complaint', success: false });
    }

    const previousStatus = complaint.status;
    complaint.status = 'ESCALATED';

    if (note && note.trim()) {
      complaint.investigationNotes.push({
        note: `[ESCALATION NOTE] ${note.trim()}`,
        addedBy: req.user.id,
        addedAt: new Date(),
      });
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'STATUS_CHANGED',
      previousStatus,
      newStatus: 'ESCALATED',
      performedBy: req.user.id,
      comment: note && note.trim() ? `Escalated: "${note.trim()}"` : 'Complaint escalated for senior/admin review',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint escalated successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to escalate complaint', success: false, error: error.message });
  }
};

/**
 * @desc    Close complaint (RESOLVED -> CLOSED) by Customer or Admin
 * @route   PATCH /api/complaints/:id/close
 */
export const closeComplaint = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    // Role check: Only customer who created it or Admin
    if (user.role === 'CUSTOMER') {
      const customerId = complaint.customerId?._id?.toString() || complaint.customerId?.toString();
      if (customerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only close your own complaints', success: false });
      }
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({ message: 'Only resolved complaints can be closed', success: false });
    }

    const previousStatus = complaint.status;
    complaint.status = 'CLOSED';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'STATUS_CHANGED',
      previousStatus,
      newStatus: 'CLOSED',
      performedBy: req.user.id,
      comment: req.body.note || 'Complaint accepted and closed by customer',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint closed successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to close complaint', success: false, error: error.message });
  }
};

/**
 * @desc    Reopen complaint (RESOLVED -> REOPENED) by Customer
 * @route   PATCH /api/complaints/:id/reopen
 */
export const reopenComplaint = async (req, res) => {
  try {
    const { reason, note } = req.body;
    const reopenText = reason || note;
    if (!reopenText || reopenText.trim() === '') {
      return res.status(400).json({ message: 'Reason for reopening the complaint is required', success: false });
    }

    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    if (user.role === 'CUSTOMER') {
      const customerId = complaint.customerId?._id?.toString() || complaint.customerId?.toString();
      if (customerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only reopen your own complaints', success: false });
      }
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({ message: 'Only resolved complaints can be reopened', success: false });
    }

    const previousStatus = complaint.status;
    complaint.status = 'REOPENED';
    complaint.investigationNotes.push({
      note: `[CUSTOMER REOPEN REASON] ${reopenText.trim()}`,
      addedBy: req.user.id,
      addedAt: new Date(),
    });
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'STATUS_CHANGED',
      previousStatus,
      newStatus: 'REOPENED',
      performedBy: req.user.id,
      comment: `Customer reopened complaint: "${reopenText.trim()}"`,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('customerId', 'name email username')
      .populate('categoryId', 'name')
      .populate('assignedAgentId', 'name email')
      .populate('investigationNotes.addedBy', 'name email');

    return res.status(200).json({
      message: 'Complaint reopened successfully',
      success: true,
      complaint: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reopen complaint', success: false, error: error.message });
  }
};

/**
 * @desc    Get complete audit history for a complaint
 * @route   GET /api/complaints/:id/history
 */
export const getComplaintHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: 'Complaint not found',
        success: false,
      });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found', success: false });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    // Role check:
    if (user.role === 'CUSTOMER') {
      const customerId = complaint.customerId?._id?.toString() || complaint.customerId?.toString();
      if (customerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: You can only view history of your own complaints', success: false });
      }
    } else if (user.role === 'AGENT') {
      const assignedId = complaint.assignedAgentId?._id?.toString() || complaint.assignedAgentId?.toString();
      if (assignedId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: You can only view history of complaints assigned to you', success: false });
      }
    }

    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .populate('performedBy', 'name email username role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Complaint history fetched successfully',
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch history', success: false, error: error.message });
  }
};


/**
 * @desc    Get dashboard metrics & counters (role-scoped)
 * @route   GET /api/complaints/stats or GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    if (user.role === 'ADMIN') {
      // System-wide metrics
      const [
        total,
        open,
        assigned,
        inProgress,
        escalated,
        resolved,
        closed,
        reopened,
        unassigned,
        categories,
        recent,
      ] = await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'OPEN' }),
        Complaint.countDocuments({ status: 'ASSIGNED' }),
        Complaint.countDocuments({ status: 'IN_PROGRESS' }),
        Complaint.countDocuments({ status: 'ESCALATED' }),
        Complaint.countDocuments({ status: 'RESOLVED' }),
        Complaint.countDocuments({ status: 'CLOSED' }),
        Complaint.countDocuments({ status: 'REOPENED' }),
        Complaint.countDocuments({ assignedAgentId: null }),
        Complaint.aggregate([
          { $group: { _id: '$categoryId', count: { $sum: 1 } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1 } },
        ]),
        Complaint.find()
          .populate('customerId', 'name email username')
          .populate('categoryId', 'name')
          .populate('assignedAgentId', 'name email username')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      return res.status(200).json({
        success: true,
        role: 'ADMIN',
        stats: {
          total,
          open,
          assigned,
          inProgress,
          escalated,
          resolved,
          closed,
          reopened,
          pending: open + assigned + inProgress + reopened,
          unassigned,
          byCategory: categories,
        },
        recent,
      });
    }

    if (user.role === 'AGENT') {
      // Scoped to complaints assigned to this agent
      const filter = { assignedAgentId: user._id };
      const [
        total,
        assigned,
        inProgress,
        escalated,
        resolved,
        closed,
        reopened,
        recent,
      ] = await Promise.all([
        Complaint.countDocuments(filter),
        Complaint.countDocuments({ ...filter, status: 'ASSIGNED' }),
        Complaint.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
        Complaint.countDocuments({ ...filter, status: 'ESCALATED' }),
        Complaint.countDocuments({ ...filter, status: 'RESOLVED' }),
        Complaint.countDocuments({ ...filter, status: 'CLOSED' }),
        Complaint.countDocuments({ ...filter, status: 'REOPENED' }),
        Complaint.find(filter)
          .populate('customerId', 'name email username')
          .populate('categoryId', 'name')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      return res.status(200).json({
        success: true,
        role: 'AGENT',
        stats: {
          total,
          assigned,
          inProgress,
          escalated,
          resolved: resolved + closed,
          reopened,
          pending: assigned + inProgress + reopened,
        },
        recent,
      });
    }

    // CUSTOMER
    const filter = { customerId: user._id };
    const [
      total,
      open,
      assigned,
      inProgress,
      escalated,
      resolved,
      closed,
      reopened,
      recent,
    ] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'OPEN' }),
      Complaint.countDocuments({ ...filter, status: 'ASSIGNED' }),
      Complaint.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ ...filter, status: 'ESCALATED' }),
      Complaint.countDocuments({ ...filter, status: 'RESOLVED' }),
      Complaint.countDocuments({ ...filter, status: 'CLOSED' }),
      Complaint.countDocuments({ ...filter, status: 'REOPENED' }),
      Complaint.find(filter)
        .populate('categoryId', 'name')
        .populate('assignedAgentId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      role: 'CUSTOMER',
      stats: {
        total,
        open,
        inProgress: assigned + inProgress + escalated + reopened,
        resolved,
        closed,
      },
      recent,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch dashboard stats',
      success: false,
      error: error.message,
    });
  }
};

