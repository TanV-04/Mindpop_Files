//routes/userRoute.js
import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  updateUserProfile, 
  updatePassword, 
  updatePrivacySettings
} from '../controllers/userController.js';
import { uploadProfilePicture, handleUploadErrors } from '../middleware/uploadMiddleware.js';
import { 
  validateProfileUpdate, 
  validatePasswordUpdate, 
  validatePrivacySettings 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -tokens');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        age: user.age,
        birthDate: user.birthDate,
        profilePicture: user.profilePicture,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update user profile
router.put(
  '/profile', 
  protect, 
  validateProfileUpdate,
  uploadProfilePicture.single('profilePicture'), 
  updateUserProfile,
  handleUploadErrors
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
