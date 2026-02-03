import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import validateIssue from '../middlewares/validateIssue.js';
import {
  createIssue,
  editIssue,
  deleteIssue,
  getAllIssues,
  getUserIssues,
  likeIssue,
  addComment,
  getComments,
  updateIssue,
  getPublicIssues
} from "../controllers/Issue.js";

const route = express.Router();

// Public routes (no authentication required)
route.get('/public', getPublicIssues);
route.post('/:id/like', likeIssue);
route.post('/:id/comment', addComment);
route.get('/:id/comments', getComments);

// Protected routes (authentication required)
route.post('/', protect, upload, validateIssue, createIssue);
route.get("/user", protect, getUserIssues);
route.get('/', protect, getAllIssues);

// CRITICAL FIXES: Add protect middleware to these routes
route.get('/:id', protect, editIssue);        // ← Added protect
route.delete('/:id', protect, deleteIssue);   // ← Added protect  
route.put('/:id', protect, updateIssue);      // ← Added protect - This was the main issue!

export default route;