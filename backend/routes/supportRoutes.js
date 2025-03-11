import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createSupportTicket,
  getUserTickets,
  getTicketById,
  respondToTicket
} from '../controllers/supportController.js';

const router = express.Router();

// Create new support ticket
router.post('/ticket', protect, createSupportTicket);

// Get user's support tickets
router.get('/tickets', protect, getUserTickets);

// Get a specific ticket by id
router.get('/ticket/:id', protect, getTicketById);

// Add response to a ticket
router.post('/ticket/:id/respond', protect, respondToTicket);

export default router;