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

        attachments: [{
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'audio', 'document'],
            },
            name: String,
            size: Number,
            mimeType: String,
            publicId: String,
        }],

        location: {
            latitude: Number,
            longitude: Number,
            address: String,
            placeName: String,
        },

        isViewOnce: {
            type: Boolean,
            default: false,
        },

        viewedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            viewedAt: {
                type: Date,
                default: Date.now,
            },
        }],

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