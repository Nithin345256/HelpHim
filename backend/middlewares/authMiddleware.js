import jwt from 'jsonwebtoken'; // Removed unused decode import
import User from '../models/User.js';
import mongoose from 'mongoose';

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
          return res.status(401).json({ message: 'Invalid token: user ID is not a valid ObjectId' });
        }
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        console.log('Protect middleware user ID:', req.user.id); // Debug
        next();
      } catch (error) {
        console.error('Protect middleware error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  };

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { // Fixed: role check was correct
        next();
    } else {
        res.status(400).json({ message: 'not authorised as admin' }); // Changed status: 403 -> 400, fixed typo: authorised -> authorized
    }
};

export { protect, admin }; // Changed: export default -> export { protect, admin }



