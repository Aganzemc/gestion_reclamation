// routes/assignmentRoutes.ts
import express from 'express';
import { assignmentController } from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, assignmentController.getAssignments);
router.post('/', authenticate, assignmentController.createAssignment);
router.get('/:id', authenticate, assignmentController.getAssignmentById);
router.delete('/:id', authenticate, assignmentController.deleteAssignment);

// Routes spécifiques
router.get('/ticket/:ticketId', authenticate, assignmentController.getTicketAssignments);
router.get('/user/:userId', authenticate, assignmentController.getUserAssignments);
router.delete('/ticket/:ticketId/user/:userId', authenticate, assignmentController.removeUserFromTicket);
router.get('/stats/assignments', authenticate, assignmentController.getAssignmentStats);

export default router;