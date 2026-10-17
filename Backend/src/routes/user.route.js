import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { updateStatus, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/status", protectRoute, updateStatus);
router.get("/:id", protectRoute, getUserById);

export default router;
