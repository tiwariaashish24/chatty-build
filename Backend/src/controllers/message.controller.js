import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import Room from "../models/room.model.js";


//get Users For Sidebar
export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in getUsersForSidebar", error.message);
         res.status(500).json({error: "Internal server error"});
    }
};

//get online users
export const getOnlineUsers = async(req, res) => {
    try {
        const onlineUsers = await User.find({ isOnline: true }).select("-password");
        res.status(200).json(onlineUsers);
    } catch (error) {
        console.log("Error in getOnlineUsers", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

//get message (direct messages)
export const getMessages = async(req, res) => {
    try {
        const  { id:userToChatId } = req.params;
        const myId = req.user._id;


        const messages = await Message.find({
            $or: [
                {senderId: myId, reciverId: userToChatId},
                {senderId: userToChatId, reciverId: myId},
            ],
            isDeleted: false
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({message: "Internal server error"});

    }
}

//get room messages
export const getRoomMessages = async(req, res) => {
    try {
        const { id: roomId } = req.params;

        const messages = await Message.find({
            roomId,
            isDeleted: false
        })
        .populate("senderId", "fullName profilePic")
        .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getRoomMessages controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//send message (direct message)
export const sendMessage = async(req, res) => {
    try {

        const { text, attachments, location, isViewOnce } = req.body;
        const { id: reciverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            reciverId,
            text,
            attachments: attachments || [],
            location,
            isViewOnce: isViewOnce || false,
        });

        await newMessage.save();

      
        const io = req.app.get('io');

        
        io.to(reciverId).emit('receiveMessage', newMessage);
        
        io.to(senderId.toString()).emit('receiveMessage', newMessage);

        res.status(201).json(newMessage)



    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({message: "Internal server error"});

    }
}

//send room message
export const sendRoomMessage = async(req, res) => {
    try {
        const { text, image } = req.body;
        const { id: roomId } = req.params;
        const senderId = req.user._id;

        // Verify user is member of room
        const room = await Room.findById(roomId);
        if (!room || !room.members.includes(senderId)) {
            return res.status(403).json({ message: "Not a member of this room" });
        }

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            roomId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        room.lastMessage = newMessage._id;
        room.lastActivity = new Date();
        await room.save();

        const io = req.app.get('io');

       
        io.to(roomId).emit('receiveRoomMessage', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendRoomMessage controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//delete message
export const deleteMessage = async(req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Can only delete your own messages" });
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();

       
        const io = req.app.get('io');

        if (message.roomId) {
            io.to(message.roomId.toString()).emit('messageDeleted', { messageId });
        } else {
            io.to(message.reciverId.toString()).emit('messageDeleted', { messageId });
            io.to(message.senderId.toString()).emit('messageDeleted', { messageId });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//edit message
export const editMessage = async(req, res) => {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Can only edit your own messages" });
        }

        message.text = text;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        
        const io = req.app.get('io');

      
        if (message.roomId) {
            io.to(message.roomId.toString()).emit('messageEdited', message);
        } else {
            io.to(message.reciverId.toString()).emit('messageEdited', message);
            io.to(message.senderId.toString()).emit('messageEdited', message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//add reaction to message
export const addReaction = async(req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

       
        const existingReaction = message.reactions.find(
            r => r.userId.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReaction) {
           
            message.reactions = message.reactions.filter(
                r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
            );
        } else {
         
            message.reactions.push({ userId, emoji });
        }

        await message.save();

       
        const io = req.app.get('io');

      
        if (message.roomId) {
            io.to(message.roomId.toString()).emit('messageReaction', { messageId, reactions: message.reactions });
        } else {
            io.to(message.reciverId.toString()).emit('messageReaction', { messageId, reactions: message.reactions });
            io.to(message.senderId.toString()).emit('messageReaction', { messageId, reactions: message.reactions });
        }

        res.status(200).json({ reactions: message.reactions });
    } catch (error) {
        console.log("Error in addReaction controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//mark message as read
export const markAsRead = async(req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only receiver can mark as read
        if (message.reciverId && message.reciverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Can only mark received messages as read" });
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();


        const io = req.app.get('io');


        io.to(message.senderId.toString()).emit('messageRead', { messageId });

        res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
        console.log("Error in markAsRead controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//mark view-once message as viewed
export const markViewOnceViewed = async(req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.isViewOnce) {
            return res.status(400).json({ message: "Not a view-once message" });
        }

        // Check if already viewed by this user
        const alreadyViewed = message.viewedBy.some(
            v => v.userId.toString() === userId.toString()
        );

        if (!alreadyViewed) {
            message.viewedBy.push({ userId });
            await message.save();
        }

        res.status(200).json({ message: "Message marked as viewed" });
    } catch (error) {
        console.log("Error in markViewOnceViewed controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}
