import express from 'express';
import { getAgents, getAllUsers } from '../controllers/user.controller.js';
import { authUser, authorize } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.use(authUser);

userRouter.get('/agents', authorize('ADMIN', 'AGENT'), getAgents);
userRouter.get('/', authorize('ADMIN'), getAllUsers);

export default userRouter;
