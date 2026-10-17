import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reciverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        },

        text: {
            type: String,

        },
        image: {
            type: String,
        },

        isEdited: {
            type: Boolean,
            default: false,
        },

        editedAt: {
            type: Date,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
        },

        reactions: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            emoji: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
        },
},
{timestamps : true}

);

const Message = mongoose.model("Message", messageSchema);

export default Message;