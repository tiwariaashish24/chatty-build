import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{

     email: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["online", "offline", "busy", "away"],
      default: "offline",
    },

    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    friendRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system"
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    chatBackground: {
      type: String,
      default: "",
    },

},
{timestamps: true}

);


const User = mongoose.model("User", userSchema);

export default User;