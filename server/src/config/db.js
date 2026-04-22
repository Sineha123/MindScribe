import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mindscribe");
    console.log("MongoDB connected: mongodb://127.0.0.1:27017/mindscribe");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}
