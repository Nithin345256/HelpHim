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

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Debug logging
    console.log('Officer role:', req.user.role);
    console.log('Officer specialization:', req.user.specialization);
    console.log('Issue specialization:', issue.specialization);
    console.log('Officer id:', req.user.id);
    console.log('Issue user:', issue.user.toString());

    if (
      issue.user.toString() !== req.user.id && // not the creator
      req.user.role !== 'admin' && // not admin
      !(req.user.role === 'officer' && issue.specialization === req.user.specialization) // not officer for this specialization
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    issue.title = title || issue.title;
    issue.description = description || issue.description;
    issue.specialization = specialization || issue.specialization;
    if (location) {
      issue.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }
    if (photo) issue.photo = photo;
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      issue.status = status || issue.status;
    }

    await issue.save();
    res.status(200).json({ message: 'Issue updated successfully', issue });
  } catch (error) {
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
    let issues;
    if (req.user && req.user.role === 'officer') {
      // Only show non-resolved issues matching officer's specialization
      issues = await Issue.find({ 
        specialization: req.user.specialization,
        status: { $ne: 'Resolved' }
      }).sort({ createdAt: -1 });
    } else if (req.user && req.user.role === 'admin') {
      // Admin: show all issues (including resolved)
      issues = await Issue.find().sort({ createdAt: -1 });
    } else if (req.user && req.user.role === 'user') {
      // User: show only their own (including resolved)
      issues = await Issue.find({ user: req.user.id }).sort({ createdAt: -1 });
    } else {
      // Public: show all non-resolved issues
      issues = await Issue.find({ status: { $ne: 'Resolved' } }).sort({ createdAt: -1 });
    }
    res.status(200).json(issues);
  } catch (error) {
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
    const userId = req.user.id;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const likeIndex = issue.likes.indexOf(userId);
    if (likeIndex === -1) {
      issue.likes.push(userId);
    } else {
      issue.likes.splice(likeIndex, 1);
    }

    await issue.save();
    res.status(200).json({ likes: issue.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = {
      content,
      author: userId
    };

    issue.comments.push(comment);
    await issue.save();

    const populatedComment = await Issue.findById(id)
      .populate('comments.author', 'username')
      .select('comments')
      .then(issue => issue.comments[issue.comments.length - 1]);

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id)
      .populate('comments.author', 'username')
      .select('comments');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json(issue.comments);
  } catch (error) {
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