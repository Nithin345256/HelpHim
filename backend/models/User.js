import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Changed to bcryptjs for consistency

const userSchema = new mongoose.Schema({ // Fixed typo: userScheame -> userSchema
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'officer'],
        default: 'user'
    },
    specialization: {
        type: String,
        enum: ['Water Issue', 'Sanitation', 'Pothole', 'Garbage', 'Traffic', 'Other', ''], // Capitalized and fixed typo: pathole -> Pothole
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);