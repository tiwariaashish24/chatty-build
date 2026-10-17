import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("URL:", process.env.MONGODB_URL);

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ MongoDB Connected");
    console.log("State:", mongoose.connection.readyState);
  } catch (error) {
    console.error("❌ MongoDB Error:");
    console.dir(error, {depth:10});
  }
};