import { body } from 'express-validator';

export const validateRegister = [ // Added explicit export
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['user', 'admin', 'officer']).withMessage('Role must be user, admin, or officer'),
  body('specialization')
    .if(body('role').custom((value, { req }) => req.body.role === 'admin' || req.body.role === 'officer'))
    .notEmpty()
    .withMessage('Specialization is required for admin or officer role')
    .isIn(['Water Issue', 'Sanitation', 'Pothole', 'Garbage', 'Traffic', 'Other'])
    .withMessage('Invalid specialization'),
];

export const validateLogin = [ // Added explicit export
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];