import User from '../models/user.model.js';

/**
 * @desc    Get all agents (for assignment & admin view)
 * @route   GET /api/users/agents
 */
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'AGENT', isActive: true }).select('name email username role');
    return res.status(200).json({
      message: 'Agents fetched successfully',
      success: true,
      agents,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch agents',
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users (ADMIN view)
 * @route   GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role.toUpperCase();

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      message: 'Users fetched successfully',
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch users',
      success: false,
      error: error.message,
    });
  }
};
