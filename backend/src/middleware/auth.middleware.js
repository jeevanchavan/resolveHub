import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authUser = async (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      success: false,
      err: 'Token not provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // new property 
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized',
      success: false,
      err: 'Invalid token'
    });
  }
};

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found', success: false });
      }

      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
      if (!normalizedAllowed.includes(user.role?.toUpperCase())) {
        return res.status(403).json({ message: 'Forbidden', success: false, err: 'Access denied' });
      }

      // new property to store user document
      req.userDoc = user;
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Server error', success: false, error: err.message });
    }
  };
};

export default { authUser, authorize };
