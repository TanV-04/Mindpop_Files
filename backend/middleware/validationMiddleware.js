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