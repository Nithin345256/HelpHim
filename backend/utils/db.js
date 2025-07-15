import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);

        console.log(`mongoDB connected:${conn.connection.host}`);
    } catch (error) {
        console.error(`mongodb connection error:${error.message}`);
        process.exit(1);
    }
}

export default connectDB;