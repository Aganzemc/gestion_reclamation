// routes/notificationRoutes.ts
import express from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.post('/', authenticate, notificationController.createNotification);
router.get('/:id', authenticate, notificationController.getNotificationById);
router.put('/:id', authenticate, notificationController.updateNotification);
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Routes spécifiques
router.get('/user/:userId', authenticate, notificationController.getUserNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/:id/unread', authenticate, notificationController.markAsUnread);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.get('/unread/count/:userId', authenticate, notificationController.getUnreadCount);
router.get('/stats/notifications', authenticate, notificationController.getNotificationStats);

export default router;