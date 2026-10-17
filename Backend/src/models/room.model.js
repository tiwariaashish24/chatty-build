import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        type: {
            type: String,
            enum: ["text", "voice", "direct"],
            default: "text",
        },

        isPrivate: {
            type: Boolean,
            default: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        admins: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        icon: {
            type: String,
            default: "",
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
