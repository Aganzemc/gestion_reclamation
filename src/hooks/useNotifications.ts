// hooks/useNotifications.ts
import { useNotificationStore } from '../stores/notificationStore';

export const useNotifications = () => {
  const {
    notifications,
    currentNotification,
    userNotifications,
    unreadCount,
    notificationStats,
    loading,
    error,
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    getUserNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    getUnreadCount,
    getNotificationStats,
    clearError,
    setCurrentNotification
  } = useNotificationStore();

  return {
    notifications,
    currentNotification,
    userNotifications,
    unreadCount,
    notificationStats,
    loading,
    error,
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    getUserNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    getUnreadCount,
    getNotificationStats,
    clearError,
    setCurrentNotification
  };
};