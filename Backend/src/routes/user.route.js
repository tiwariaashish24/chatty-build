import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    updateStatus,
    getUserById,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendRequests,
    removeFriend,
    updateTheme,
    generateInviteCode,
    acceptInvite,
    updateProfile
} from "../controllers/user.controller.js";

const router = express.Router();

router.put("/status", protectRoute, updateStatus);
router.get("/search/users", protectRoute, searchUsers);
router.get("/friends/list", protectRoute, getFriends);
router.get("/friends/requests", protectRoute, getFriendRequests);
router.post("/friends/request/:recipientId", protectRoute, sendFriendRequest);
router.post("/friends/accept/:senderId", protectRoute, acceptFriendRequest);
router.post("/friends/reject/:senderId", protectRoute, rejectFriendRequest);
router.delete("/friends/:friendId", protectRoute, removeFriend);
router.put("/theme", protectRoute, updateTheme);
router.post("/invite/generate", protectRoute, generateInviteCode);
router.post("/invite/accept/:inviteCode", protectRoute, acceptInvite);
router.put("/profile", protectRoute, updateProfile);
router.get("/:id", protectRoute, getUserById);

export default router;
