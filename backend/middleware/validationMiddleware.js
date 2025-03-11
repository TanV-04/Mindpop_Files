// import { check, validationResult } from 'express-validator';

// export const validateRegistration = [
//     check('username')
//         .trim()
//         .isLength({ min: 3 })
//         .withMessage('Username must be at least 3 characters long'),
//     check('email')
//         .trim()
//         .isEmail()
//         .normalizeEmail()
//         .withMessage('Please provide a valid email'),
//     check('password')
//         .isLength({ min: 6 })
//         .withMessage('Password must be at least 6 characters long'),
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     }
// ];

// export const validateLogin = [
//     check('email')
//         .trim()
//         .isEmail()
//         .normalizeEmail()
//         .withMessage('Please provide a valid email'),
//     check('password')
//         .exists()
//         .withMessage('Password is required'),
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     }
// ];


import { check, validationResult } from 'express-validator';

export const validateRegistration = [
    check('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    // Optional fields for the user profile
    check('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    check('age')
        .optional()
        .isInt({ min: 0, max: 120 })
        .withMessage('Age must be between 0 and 120'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateLogin = [
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .exists()
        .withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateProfileUpdate = [
    check('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    check('username')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    check('email')
        .optional()
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    check('age')
        .optional()
        .isInt({ min: 0, max: 120 })
        .withMessage('Age must be between 0 and 120'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validatePasswordUpdate = [
    check('currentPassword')
        .exists()
        .withMessage('Current password is required'),
    check('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    check('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validatePrivacySettings = [
    check('shareProgressWithTeachers')
        .optional()
        .isBoolean()
        .withMessage('shareProgressWithTeachers must be a boolean'),
    check('allowActivityTracking')
        .optional()
        .isBoolean()
        .withMessage('allowActivityTracking must be a boolean'),
    check('receiveEmails')
        .optional()
        .isBoolean()
        .withMessage('receiveEmails must be a boolean'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];