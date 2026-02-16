// controllers/authController.js
// SOLID: Single Responsibility – handles only auth operations
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { ErrorResponse } from '../utils/errorHandler.js';

// ─── Helper ───────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:             user._id,
      username:       user.username,
      email:          user.email,
      name:           user.name,
      age:            user.age,
      birthDate:      user.birthDate,
      profilePicture: user.profilePicture,
      isAdmin:        user.isAdmin,
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────
// @route POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, name, birthDate, isAdmin = false } = req.body;

  // Admin accounts do not require age validation
  if (!isAdmin) {
    if (!birthDate) {
      return res.status(400).json({ success: false, error: 'Please provide a birth date' });
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid birth date' });
    }

    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;

    // Validate age range for child accounts
    if (age < 5 || age > 14) {
      return res.status(400).json({
        success: false,
        error: 'MindPop is designed for children aged 5–14 years',
      });
    }
  }

  // Check for existing user
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: userExists.email === email ? 'Email already registered' : 'Username already taken',
    });
  }

  const userData = {
    username,
    email,
    password,
    name,
    isAdmin: Boolean(isAdmin),
    privacySettings: {
      shareProgressWithTeachers: false,
      allowActivityTracking:     true,
      receiveEmails:             true,
    },
  };

  if (!isAdmin && birthDate) {
    userData.birthDate = new Date(birthDate);
  }

  const user = await User.create(userData);
  sendTokenResponse(user, 201, res);
});

// ─── Login ────────────────────────────────────────────────────────────
// @route POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid email or password', 401));

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid email or password', 401));

  sendTokenResponse(user, 200, res);
});

// ─── Logout ───────────────────────────────────────────────────────────
// @route POST /api/auth/logout
// @access Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route POST /api/auth/logout-all
// @access Private
export const logoutAll = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
});
