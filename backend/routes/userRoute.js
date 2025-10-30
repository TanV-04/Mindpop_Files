//userRoutes.js
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
//router.get('/me', protect, getUserProfile);

router.get('/me', requireAuth, async (req, res) => {
try {
const user = await user.findById(req.userId).select('-password');
if (!user) return res.status(404).json({ message: 'Not found' });
// Mongoose virtual `age` will be present because toJSON/toObject have virtuals
res.json(user);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});

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
//get age
router.get('/:id/age', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user by ID and return age
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ age: user.age });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

export default router;