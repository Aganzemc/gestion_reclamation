// routes/ticketRoutes.ts
import express from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth';
import { assignmentController } from '../controllers/assignmentController';

const router = express.Router();
// authenticate 
router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', authenticate, ticketController.deleteTicket);
router.patch('/:id/status', authenticate, ticketController.updateTicketStatus);
router.get('/user/:userId', authenticate, ticketController.getUserTickets);

// Routes pour les assignations d'un ticket spécifique
router.get('/:ticketId/assignments', authenticate, assignmentController.getTicketAssignments);
router.post('/:ticketId/assignments', authenticate, assignmentController.createAssignment);
router.delete('/:ticketId/assignments/:assignmentId', authenticate, assignmentController.deleteAssignment);

export default router;