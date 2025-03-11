import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import bcrypt from 'bcryptjs';
import { ErrorResponse } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';
import { existsSync, unlinkSync } from 'fs';  // Import sync functions from regular fs
import fs from 'fs/promises';
import path from 'path';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
  // req.user is set by the auth middleware
  const user = await User.findById(req.user.id).select('-password -tokens');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    // Wrap the user data in a 'data' field
    data: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      age: user.age,
      profilePicture: user.profilePicture,
      privacySettings: user.privacySettings
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Old profile picture handling
  const oldProfilePicture = user.profilePicture;

  // Update basic profile data
  if (req.body.name) user.name = req.body.name;
  if (req.body.username) user.username = req.body.username;
  if (req.body.email) user.email = req.body.email;
  if (req.body.age) user.age = req.body.age;
  
  // Handle profile picture upload
  if (req.file) {
    // Store the relative path instead of full URL to avoid CORS issues
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    
    // Delete old profile picture if it exists and is not a default image
    if (oldProfilePicture && oldProfilePicture.includes('/uploads/profiles/')) {
      try {
        // Extract the filename from the path
        let oldFileName;
        
        // Handle both full URLs and relative paths
        if (oldProfilePicture.includes('http')) {
          const url = new URL(oldProfilePicture);
          oldFileName = path.basename(url.pathname);
        } else {
          oldFileName = path.basename(oldProfilePicture);
        }
        
        const oldFilePath = path.join('./uploads/profiles/', oldFileName);
        
        // Use the imported sync functions for file operations
        if (existsSync(oldFilePath)) {
          unlinkSync(oldFilePath);
          logger.info(`Deleted old profile picture: ${oldFilePath}`);
        }
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
        // Continue with the update even if file deletion fails
      }
    }
    
    // Update user's profile picture with the relative path
    user.profilePicture = profilePicturePath;
    logger.info(`Set new profile picture: ${profilePicturePath}`);
  }
  
  // Save updated user
  const updatedUser = await user.save();
  
  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      age: updatedUser.age,
      profilePicture: updatedUser.profilePicture,
      privacySettings: updatedUser.privacySettings
    }
  });
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if current password matches
  const isMatch = await user.matchPassword(currentPassword);
  
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }
  
  // Set new password - the pre-save hook will hash it
  user.password = newPassword;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Update privacy settings
// @route   PUT /api/users/privacy
// @access  Private
export const updatePrivacySettings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Initialize privacySettings if it doesn't exist
  if (!user.privacySettings) {
    user.privacySettings = {
      shareProgressWithTeachers: false,
      allowActivityTracking: true,
      receiveEmails: true
    };
  }
  
  // Update privacy settings
  const { shareProgressWithTeachers, allowActivityTracking, receiveEmails } = req.body;
  
  if (shareProgressWithTeachers !== undefined) {
    user.privacySettings.shareProgressWithTeachers = shareProgressWithTeachers;
  }
  
  if (allowActivityTracking !== undefined) {
    user.privacySettings.allowActivityTracking = allowActivityTracking;
  }
  
  if (receiveEmails !== undefined) {
    user.privacySettings.receiveEmails = receiveEmails;
  }
  
  await user.save();
  
  res.status(200).json({ 
    success: true,
    message: 'Privacy settings updated successfully',
    data: {
      privacySettings: user.privacySettings
    }
  });
});

// @desc    Logout from all devices
// @route   POST /api/users/logout-all
// @access  Private
export const logoutAllDevices = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Clear all tokens if the tokens array exists
  if (user.tokens) {
    user.tokens = [];
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
});