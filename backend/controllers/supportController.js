import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { logger } from '../utils/logger.js';

// @desc    Create new support ticket
// @route   POST /api/support/ticket
// @access  Private
export const createSupportTicket = asyncHandler(async (req, res) => {
  const { subject, message, email } = req.body;
  
  if (!subject || !message) {
    res.status(400);
    throw new Error('Please provide subject and message');
  }
  
  // Get user details
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Use provided email or fallback to user's email
  const contactEmail = email || user.email;
  
  // Create support ticket
  const ticket = await SupportTicket.create({
    userId: req.user.id,
    subject,
    message,
    email: contactEmail,
    status: 'open'
  });
  
  // You would normally send email notifications here
  // We'll just log it for now
  logger.info(`New support ticket created: ${ticket._id} by user ${user.username}`);
  
  res.status(201).json({ 
    message: 'Support ticket created successfully',
    ticketId: ticket._id 
  });
});

// @desc    Get user's support tickets
// @route   GET /api/support/tickets
// @access  Private
export const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
  
  res.status(200).json(tickets);
});

// @desc    Get a specific ticket details
// @route   GET /api/support/ticket/:id
// @access  Private
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  
  // Verify ticket belongs to user
  if (ticket.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this ticket');
  }
  
  res.status(200).json(ticket);
});

// @desc    Add response to a ticket
// @route   POST /api/support/ticket/:id/respond
// @access  Private
export const respondToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }
  
  const ticket = await SupportTicket.findById(req.params.id);
  
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  
  // Verify ticket belongs to user
  if (ticket.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to respond to this ticket');
  }
  
  // Add user response
  ticket.responses.push({
    message,
    isAdmin: false,
    createdAt: new Date()
  });
  
  // Update ticket status if it was closed
  if (ticket.status === 'closed') {
    ticket.status = 'open';
  }
  
  await ticket.save();
  
  res.status(200).json({ 
    message: 'Response added successfully',
    ticket
  });
});