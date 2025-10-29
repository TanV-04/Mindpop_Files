// import User from '../models/User.js';
// import { asyncHandler } from '../middleware/errorMiddleware.js';
// import { ErrorResponse } from '../utils/errorHandler.js';

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// export const register = asyncHandler(async (req, res, next) => {
//     try {
//         const { username, email, password } = req.body;
//         console.log("Received registration request:", { username, email }); // Log registration attempt

//         // Check if user exists
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'User already exists'
//             });
//         }

//         // Create user
//         const user = await User.create({
//             username,
//             email,
//             password
//         });

//         // Generate token
//         const token = user.getSignedJwtToken();

//         res.status(201).json({
//             success: true,
//             token,
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email
//             }
//         });
//     } catch (error) {
//         console.error("Registration error:", error); // Log any errors
//         next(error);
//     }
// });

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// export const login = asyncHandler(async (req, res, next) => {
//     const { email, password } = req.body;

//     // Validate email & password
//     if (!email || !password) {
//         return next(new ErrorResponse('Please provide email and password', 400));
//     }

//     // Check for user
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//         return next(new ErrorResponse('Invalid credentials', 401));
//     }

//     // Check if password matches
//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//         return next(new ErrorResponse('Invalid credentials', 401));
//     }

//     // Generate token
//     const token = user.getSignedJwtToken();

//     // Send response
//     res.status(200).json({
//         success: true,
//         token,
//         user: {
//             id: user._id,
//             username: user.username,
//             email: user.email
//         }
//     });
// });

import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { ErrorResponse } from "../utils/errorHandler.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password, name, age } = req.body;
    console.log("Received registration request:", { username, email }); // Log registration attempt

    // Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      !name ||
      age === undefined ||
      age === null
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields including age",
      });
    }

    // Validate age range
    if (age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid age between 1 and 120",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    // Create user with additional fields
    const user = await User.create({
      username,
      email,
      password,
      name: name || username, // Use name if provided, otherwise default to username
      age: age,
      privacySettings: {
        shareProgressWithTeachers: false,
        allowActivityTracking: true,
        receiveEmails: true,
      },
    });

    // Generate token
    const token = user.getSignedJwtToken();

    // Add token to user's tokens array if that field exists
    if (user.tokens) {
      user.tokens.push(token);
      await user.save();
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        age: user.age,
      },
    });
  } catch (error) {
    console.error("Registration error:", error); // Log any errors
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Generate token
  const token = user.getSignedJwtToken();

  // Add token to user's tokens array if that field exists
  if (user.tokens) {
    user.tokens = user.tokens || [];
    user.tokens.push(token);
    await user.save();
  }

  // Send response
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      age: user.age,
      profilePicture: user.profilePicture,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorResponse("No token provided", 400));
  }

  // Find the user by id
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Remove the token from user's tokens array if that field exists
  if (user.tokens) {
    user.tokens = user.tokens.filter((t) => t !== token);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = asyncHandler(async (req, res, next) => {
  // Find the user by id
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Clear tokens array if it exists
  if (user.tokens) {
    user.tokens = [];
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully",
  });
});
