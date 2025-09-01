// routes/userRoutes.ts (extension)
import express from 'express';
import { userController } from '../controllers/user.controller';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Routes existantes pour les utilisateurs...
router.get('/', authenticate, userController.getUsers);
router.post('/', authenticate, userController.createUser);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

// Routes pour les notifications d'un utilisateur spécifique
router.get('/:userId/notifications', authenticate, notificationController.getUserNotifications);
router.patch('/:userId/notifications/read-all', authenticate, notificationController.markAllAsRead);
router.get('/:userId/notifications/unread-count', authenticate, notificationController.getUnreadCount);

export default router;