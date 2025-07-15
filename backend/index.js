import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from "./utils/db.js"
import router from "./routes/auth.js"
import route from "./routes/Issue.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", router)
app.use("/api/issues", route)

// Connect to MongoDB and then start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();