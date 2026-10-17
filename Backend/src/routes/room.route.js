import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    createRoom,
    getUserRooms,
    getRoom,
    joinRoom,
    leaveRoom,
    addMember,
    removeMember,
    updateRoom,
    deleteRoom
} from "../controllers/room.controller.js";

const router = express.Router();

router.post("/", protectRoute, createRoom);
router.get("/", protectRoute, getUserRooms);
router.get("/:id", protectRoute, getRoom);
router.post("/:id/join", protectRoute, joinRoom);
router.post("/:id/leave", protectRoute, leaveRoom);
router.post("/:id/add-member", protectRoute, addMember);
router.delete("/:id/members/:userId", protectRoute, removeMember);
router.put("/:id", protectRoute, updateRoom);
router.delete("/:id", protectRoute, deleteRoom);

export default router;
