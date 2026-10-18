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

// Search users by email or name
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        { fullName: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        console.log("Error in searchUsers controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user._id;

        if (senderId.toString() === recipientId) {
            return res.status(400).json({ message: "Cannot send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already friends
        if (recipient.friends.includes(senderId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check if request already sent
        if (recipient.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        recipient.friendRequests.push(senderId);
        await recipient.save();

        const io = req.app.get('io');
        io.to(recipientId).emit('friendRequestReceived', { senderId });

        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.log("Error in sendFriendRequest controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const recipientId = req.user._id;

        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        if (!sender) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request exists
        if (!recipient.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        // Add to friends list for both users
        recipient.friends.push(senderId);
        sender.friends.push(recipientId);

        // Remove from friend requests
        recipient.friendRequests = recipient.friendRequests.filter(id => id.toString() !== senderId.toString());

        await recipient.save();
        await sender.save();

        const io = req.app.get('io');
        io.to(senderId).emit('friendRequestAccepted', { recipientId });

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const recipientId = req.user._id;

        const recipient = await User.findById(recipientId);

        // Remove from friend requests
        recipient.friendRequests = recipient.friendRequests.filter(id => id.toString() !== senderId.toString());
        await recipient.save();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.log("Error in rejectFriendRequest controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get friends list
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('friends', 'fullName email profilePic isOnline status lastSeen')
            .select("-password");

        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getFriends controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('friendRequests', 'fullName email profilePic isOnline status lastSeen')
            .select("-password");

        res.status(200).json(user.friendRequests);
    } catch (error) {
        console.log("Error in getFriendRequests controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove friend
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove from friends list for both users
        user.friends = user.friends.filter(id => id.toString() !== friendId.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== userId.toString());

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Friend removed" });
    } catch (error) {
        console.log("Error in removeFriend controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update theme preference
export const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        const userId = req.user._id;

        const validThemes = ["light", "dark", "system"];
        if (!validThemes.includes(theme)) {
            return res.status(400).json({ message: "Invalid theme" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { theme },
            { new: true }
        ).select("-password");

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateTheme controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Generate invite code
export const generateInviteCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user.inviteCode) {
            return res.status(200).json({ inviteCode: user.inviteCode });
        }

        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        user.inviteCode = inviteCode;
        await user.save();

        res.status(200).json({ inviteCode });
    } catch (error) {
        console.log("Error in generateInviteCode controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept invite
export const acceptInvite = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user._id;

        const inviter = await User.findOne({ inviteCode });

        if (!inviter) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        if (inviter._id.toString() === userId) {
            return res.status(400).json({ message: "Cannot accept your own invite" });
        }

        // Check if already friends
        if (inviter.friends.includes(userId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Add to friends list for both users
        inviter.friends.push(userId);
        const currentUser = await User.findById(userId);
        currentUser.friends.push(inviter._id);

        await inviter.save();
        await currentUser.save();

        const io = req.app.get('io');
        io.to(inviter._id.toString()).emit('friendAdded', { friendId: userId });

        res.status(200).json({ message: "Invite accepted successfully", inviter: inviter.fullName });
    } catch (error) {
        console.log("Error in acceptInvite controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, username, bio, profilePic, chatBackground } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (username) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (profilePic) updateData.profilePic = profilePic;
        if (chatBackground !== undefined) updateData.chatBackground = chatBackground;

        // Check if username is already taken
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateProfile controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
