import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  updatePassword, 
  updatePrivacySettings
} from '../controllers/userController.js';
import { uploadProfilePicture,handleUploadErrors } from '../middleware/uploadMiddleware.js';
import { 
  validateProfileUpdate, 
  validatePasswordUpdate, 
  validatePrivacySettings 
} from '../middleware/validationMiddleware.js';



const router = express.Router();

// Get current user profile
router.get('/me', protect, getUserProfile);

// Update user profile (with profile picture upload capability)
router.put(
  '/profile', 
  protect, 
  validateProfileUpdate,
  uploadProfilePicture.single('profilePicture'), 
  updateUserProfile,
  handleUploadErrors // Add error handling middleware
);

// Update user password
router.put(
  '/password', 
  protect, 
  validatePasswordUpdate,
  updatePassword
);

// Update privacy settings
router.put(
  '/privacy', 
  protect, 
  validatePrivacySettings,
  updatePrivacySettings
);

export default router;