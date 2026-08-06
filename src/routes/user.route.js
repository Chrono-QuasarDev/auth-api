import { Router } from "express";
import { authUser } from '../middleware/auth.middleware.js';
import { getProfile } from "../controllers/user.controller.js";

const router = Router();

router.get('/profile', authUser, getProfile);

export default router;