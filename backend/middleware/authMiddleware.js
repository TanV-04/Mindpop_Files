import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

// Protect routes - middleware to check for valid JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (remove Bearer prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id from token, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      // Optional: Check if token is in user's tokens array if you implement token tracking
      if (req.user?.tokens && req.user.tokens.length > 0 && !req.user.tokens.includes(token)) {
        return next(new ErrorResponse('Not authorized, token not found in user tokens', 401));
      }

      if (!req.user) {
        return next(new ErrorResponse('User not found', 404));
      }

      next();
    } catch (error) {
      logger.error('Auth error:', error.message);
      return next(new ErrorResponse('Not authorized, token failed', 401));
    }
  } else {
    return next(new ErrorResponse('Not authorized, no token provided', 401));
  }
});

// Admin routes middleware (if you need admin functionality)
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return next(new ErrorResponse('Not authorized as an admin', 401));
  }
};