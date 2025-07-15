import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { username, email, password, role, specialization } = req.body;

        const existinguser = await User.findOne({ email });
        if (existinguser) {
            return res.status(400).json({ message: "user already exist" });
        }

        const user = new User({
            username,
            email,
            password,
            role: role || 'user',
            specialization: (role === 'admin' || role === 'officer') ? specialization : '',
        });

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { // Fixed typo: process,env -> process.env
            expiresIn: '1d',
        });

        res.status(201).json({
            token,
            user: { id: user._id, username, email, role: user.role, specialization: user.specialization },
        });
    } catch (error) {
        console.error(error); // Fixed: err -> error
        res.status(500).json({ message: 'server error' });
    }
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "invalid credentials" }); // Fixed typo: invaild -> invalid
        }

        const isMatch = await user.comparePassword(password); // Fixed: User.comparePassword -> user.comparePassword

        if (!isMatch) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            token,
            user: { id: user._id, username: user.username, email, role: user.role, specialization: user.specialization },
        });
    } catch (error) {
        console.error(error); // Fixed: err -> error
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('username email role specialization');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ 
        username: user.username, 
        email: user.email,
        role: user.role,
        specialization: user.specialization
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

export { login, register,getMe }; // Changed: export default { login, register } -> export { login, register }