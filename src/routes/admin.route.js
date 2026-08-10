import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { getAllProfiles } from '../controllers/admin.controller.js';

const router = Router();

router.get('/profiles', authUser, authorize('admin'), getAllProfiles);

export default router;