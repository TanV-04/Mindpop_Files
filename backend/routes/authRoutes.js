// import express from 'express';
// import { register, login } from '../controllers/authController.js';
// import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';

// const router = express.Router();

// router.post('/register', validateRegistration, register);
// router.post('/login', validateLogin, login);

// export default router;


import express from 'express';
import { register, login, logout, logoutAll } from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

export default router;