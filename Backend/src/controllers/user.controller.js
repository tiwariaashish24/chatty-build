import User from "../models/user.model.js";

// Update user status
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user._id;

        const validStatuses = ["online", "offline", "busy", "away"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select("-password");

        // Notify via socket
        const io = req.app.get('io');
        io.emit('userStatusChanged', { userId, status });

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateStatus controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserById controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
