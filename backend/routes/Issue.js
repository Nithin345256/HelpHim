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

route.post('/', protect, upload, validateIssue, createIssue);
route.get('/public', getPublicIssues);
route.get("/user", protect, getUserIssues);
route.get('/', protect, getAllIssues);

// Like and Comment routes
route.post('/:id/like', protect, likeIssue);
route.post('/:id/comment', protect, addComment);
route.get('/:id/comments', protect, getComments);

route.get('/:id', protect, editIssue);
route.delete('/:id', protect, deleteIssue);
route.put('/:id', protect, updateIssue);

export default route;