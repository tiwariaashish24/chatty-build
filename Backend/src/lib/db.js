import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ MongoDB Connected");
    console.log("State:", mongoose.connection.readyState);
  } catch (error) {
    const safeMessage = String(error.message || error).replace(
      /mongodb(?:\+srv)?:\/\/[^@\s]+@/gi,
      "mongodb://[redacted]@",
    );
    console.error("❌ MongoDB connection failed:", safeMessage);
    throw error;
  }
};