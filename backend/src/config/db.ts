import mongoose from "mongoose";
import { config } from "../config";

export const connectDB = async () => {
try {
await mongoose.connect(config.mongoUri);
console.log("MongoDB connected");

} catch (error) {
console.error("Database connection failed:", error);

process.exit(1);
}
};
