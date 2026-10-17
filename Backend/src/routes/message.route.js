import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    sendMessage,
    getMessages,
    getUsersForSidebar,
    getOnlineUsers,
    getRoomMessages,
    sendRoomMessage,
    deleteMessage,
    editMessage,
    addReaction,
    markAsRead
} from "../controllers/message.controller.js"

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/online", protectRoute, getOnlineUsers);
router.get("/:id", protectRoute, getMessages);
router.get("/room/:id", protectRoute, getRoomMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/room/:id", protectRoute, sendRoomMessage);

router.delete("/:id", protectRoute, deleteMessage);
router.put("/:id", protectRoute, editMessage);
router.post("/:id/reaction", protectRoute, addReaction);
router.post("/:id/read", protectRoute, markAsRead);

export default router;