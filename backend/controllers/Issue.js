import Issue from '../models/Issue.js';
import mongoose from 'mongoose';

const createIssue = async (req, res) => {
  try {
    const { title, description, specialization, location } = req.body;
    const user = req.user.id;
    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate inputs
    if (!title || !description || !specialization) {
      return res.status(400).json({ message: 'Title, description, and specialization are required' });
    }

    // Handle location
    let locationData;
    try {
      locationData = typeof location === 'string' ? JSON.parse(location) : location;
      
      if (!locationData || !locationData.type || locationData.type !== 'Point' || 
          !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Invalid location format. Must be a GeoJSON Point' });
      }

      const [lng, lat] = locationData.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || 
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({ message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid location data format' });
    }

    const issue = new Issue({
      title,
      description,
      specialization,
      location: locationData,
      photo,
      user,
    });

    await issue.save();
    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (error) {
    console.error('Create issue error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const editIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ issue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, specialization, location, status } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    console.log('=== UPDATE ISSUE DEBUG ===');
    console.log('Issue ID:', id);
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);

    // Validate issue ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId:', id);
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      console.log('Issue not found with ID:', id);
      return res.status(404).json({ message: 'Issue not found' });
    }

    console.log('Found issue:', {
      _id: issue._id,
      title: issue.title,
      specialization: issue.specialization,
      status: issue.status,
      user: issue.user.toString()
    });

    console.log('Authorization check:');
    console.log('- Issue user:', issue.user.toString());
    console.log('- Request user ID:', req.user.id);
    console.log('- Request user role:', req.user.role);
    console.log('- Request user specialization:', req.user.specialization);
    console.log('- Issue specialization:', issue.specialization);

    // Authorization logic
    const isOwner = issue.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isOfficerForSpecialization = req.user.role === 'officer' && issue.specialization === req.user.specialization;

    console.log('Authorization results:');
    console.log('- Is owner:', isOwner);
    console.log('- Is admin:', isAdmin);
    console.log('- Is officer for specialization:', isOfficerForSpecialization);

    if (!isOwner && !isAdmin && !isOfficerForSpecialization) {
      console.log('Authorization failed - returning 403');
      return res.status(403).json({ 
        message: 'Unauthorized',
        debug: {
          userRole: req.user.role,
          userSpecialization: req.user.specialization,
          issueSpecialization: issue.specialization,
          isOwner,
          isAdmin,
          isOfficerForSpecialization
        }
      });
    }

    console.log('Authorization passed - proceeding with update');

    // Update fields
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (specialization !== undefined) issue.specialization = specialization;
    
    if (location) {
      issue.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }
    
    if (photo) issue.photo = photo;
    
    // Only admin and officer can update status
    if ((req.user.role === 'admin' || req.user.role === 'officer') && status !== undefined) {
      console.log('Updating status from', issue.status, 'to', status);
      issue.status = status;
    }

    await issue.save();
    
    console.log('Issue updated successfully:', {
      _id: issue._id,
      title: issue.title,
      status: issue.status
    });

    res.status(200).json({ message: 'Issue updated successfully', issue });
  } catch (error) {
    console.error('Update issue error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await issue.deleteOne();
    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    console.log('=== GET ALL ISSUES DEBUG ===');
    console.log('User from token:', req.user);
    
    let issues;
    if (req.user && req.user.role === 'officer') {
      // Only show non-resolved issues matching officer's specialization
      console.log('Officer request - filtering by specialization:', req.user.specialization);
      issues = await Issue.find({ 
        specialization: req.user.specialization,
        status: { $ne: 'Resolved' }
      }).sort({ createdAt: -1 });
      console.log('Found officer issues:', issues.length);
    } else if (req.user && req.user.role === 'admin') {
      // Admin: show all issues (including resolved)
      console.log('Admin request - getting all issues');
      issues = await Issue.find().sort({ createdAt: -1 });
      console.log('Found admin issues:', issues.length);
    } else if (req.user && req.user.role === 'user') {
      // User: show only their own (including resolved)
      console.log('User request - filtering by user ID:', req.user.id);
      issues = await Issue.find({ user: req.user.id }).sort({ createdAt: -1 });
      console.log('Found user issues:', issues.length);
    } else {
      // Public: show all non-resolved issues
      console.log('Public request - getting non-resolved issues');
      issues = await Issue.find({ status: { $ne: 'Resolved' } }).sort({ createdAt: -1 });
      console.log('Found public issues:', issues.length);
    }
    
    res.status(200).json(issues);
  } catch (error) {
    console.error('Get all issues error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const likeIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || `anonymous_${Math.random().toString(36).substring(2, 15)}`;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const likeIndex = issue.likes.indexOf(sessionId);
    if (likeIndex === -1) {
      issue.likes.push(sessionId);
    } else {
      issue.likes.splice(likeIndex, 1);
    }

    await issue.save();
    res.status(200).json({ likes: issue.likes });
  } catch (error) {
    console.error('Like issue error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a comment to an issue
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sessionId = req.headers['x-session-id'] || `anonymous_${Math.random().toString(36).substring(2, 15)}`;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = {
      content,
      author: sessionId,
      createdAt: new Date(),
    };

    issue.comments.push(comment);
    await issue.save();

    const newComment = {
      ...comment,
      _id: issue.comments[issue.comments.length - 1]._id,
      author: { username: 'Anonymous' },
    };

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments for an issue
const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const issue = await Issue.findById(id).select('comments');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comments = issue.comments.map((comment) => ({
      ...comment.toObject(),
      author: { username: 'Anonymous' },
    }));

    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPublicIssues = async (req, res) => {
  try {
    // Exclude resolved issues from public view
    const issues = await Issue.find({ status: { $ne: 'Resolved' } }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { 
  createIssue, 
  editIssue, 
  updateIssue, 
  getAllIssues, 
  deleteIssue, 
  getUserIssues,
  likeIssue,
  addComment,
  getComments,
  getPublicIssues
};