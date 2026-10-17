import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Create a new room
export const createRoom = async (req, res) => {
    try {
        const { name, description, type, isPrivate, icon } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Room name is required" });
        }

        const newRoom = new Room({
            name,
            description,
            type,
            isPrivate,
            icon,
            createdBy: userId,
            members: [userId],
            admins: [userId],
        });

        await newRoom.save();

        res.status(201).json(newRoom);
    } catch (error) {
        console.log("Error in createRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all rooms user is a member of
export const getUserRooms = async (req, res) => {
    try {
        const userId = req.user._id;

        const rooms = await Room.find({ members: userId })
            .populate("createdBy", "fullName profilePic")
            .populate("members", "fullName profilePic isOnline status")
            .populate("lastMessage")
            .sort({ lastActivity: -1 });

        res.status(200).json(rooms);
    } catch (error) {
        console.log("Error in getUserRooms controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific room
export const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const room = await Room.findById(id)
            .populate("createdBy", "fullName profilePic")
            .populate("members", "fullName profilePic isOnline status")
            .populate("admins", "fullName profilePic");

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is a member
        if (!room.members.some(member => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "Not a member of this room" });
        }

        res.status(200).json(room);
    } catch (error) {
        console.log("Error in getRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Join a room
export const joinRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.isPrivate) {
            return res.status(403).json({ message: "Cannot join private room without invitation" });
        }

        if (room.members.includes(userId)) {
            return res.status(400).json({ message: "Already a member of this room" });
        }

        room.members.push(userId);
        room.lastActivity = new Date();
        await room.save();

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('userJoinedRoom', { userId, roomId: id });

        res.status(200).json(room);
    } catch (error) {
        console.log("Error in joinRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Leave a room
export const leaveRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.members.includes(userId)) {
            return res.status(400).json({ message: "Not a member of this room" });
        }

        // Remove user from members
        room.members = room.members.filter(member => member.toString() !== userId.toString());

        // Remove from admins if admin
        room.admins = room.admins.filter(admin => admin.toString() !== userId.toString());

        // If creator leaves, assign new admin
        if (room.createdBy.toString() === userId.toString() && room.members.length > 0) {
            room.createdBy = room.members[0];
            if (!room.admins.includes(room.members[0])) {
                room.admins.push(room.members[0]);
            }
        }

        room.lastActivity = new Date();
        await room.save();

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('userLeftRoom', { userId, roomId: id });

        res.status(200).json({ message: "Left room successfully" });
    } catch (error) {
        console.log("Error in leaveRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add member to room
export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if current user is admin
        if (!room.admins.includes(currentUserId)) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        if (room.members.includes(userId)) {
            return res.status(400).json({ message: "User already a member" });
        }

        room.members.push(userId);
        room.lastActivity = new Date();
        await room.save();

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('memberAdded', { userId, roomId: id });

        res.status(200).json(room);
    } catch (error) {
        console.log("Error in addMember controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove member from room
export const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const currentUserId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if current user is admin
        if (!room.admins.includes(currentUserId)) {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        if (!room.members.includes(userId)) {
            return res.status(400).json({ message: "User not a member" });
        }

        room.members = room.members.filter(member => member.toString() !== userId.toString());
        room.admins = room.admins.filter(admin => admin.toString() !== userId.toString());
        room.lastActivity = new Date();
        await room.save();

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('memberRemoved', { userId, roomId: id });

        res.status(200).json(room);
    } catch (error) {
        console.log("Error in removeMember controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update room
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;
        const userId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is admin
        if (!room.admins.includes(userId)) {
            return res.status(403).json({ message: "Only admins can update room" });
        }

        if (name) room.name = name;
        if (description !== undefined) room.description = description;
        if (icon !== undefined) room.icon = icon;

        room.lastActivity = new Date();
        await room.save();

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('roomUpdated', room);

        res.status(200).json(room);
    } catch (error) {
        console.log("Error in updateRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Only creator can delete
        if (room.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only creator can delete room" });
        }

        await Room.findByIdAndDelete(id);

        // Notify via socket
        const io = req.app.get('io');
        io.to(id).emit('roomDeleted', { roomId: id });

        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.log("Error in deleteRoom controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
