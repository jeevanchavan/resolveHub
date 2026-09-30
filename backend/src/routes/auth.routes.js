import express from 'express';
import { getMeUser, loginUser, registerUser, logoutUser } from '../controllers/auth.controller.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';
import { authUser } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post('/register', registerValidator, registerUser);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post('/login', loginValidator, loginUser);

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private
 */
authRouter.get('/get-me', authUser, getMeUser);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and clear cookie
 * @access Public / Private
 */
authRouter.post('/logout', logoutUser);

export default authRouter;
