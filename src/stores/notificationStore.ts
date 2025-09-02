// stores/notificationStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { Notification, NotificationType, User } from '../types/type';

// Configuration Axios de base
// const api = axios.create({
//   baseURL: '/api/notifications',
// });

const baseURL = "http://localhost:4000/api/notifications"; 

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Types étendus pour inclure les relations
export type NotificationWithUser = Notification & {
  user: User;
};

interface NotificationState {
  notifications: NotificationWithUser[];
  currentNotification: NotificationWithUser | null;
  userNotifications: NotificationWithUser[];
  unreadCount: number;
  notificationStats: any;
  loading: boolean;
  error: string | null;
  
  // Actions principales pour les notifications
  getNotifications: () => Promise<void>;
  getNotificationById: (id: string) => Promise<NotificationWithUser>;
  createNotification: (notificationData: CreateNotificationFormData) => Promise<NotificationWithUser>;
  updateNotification: (id: string, notificationData: Partial<Notification>) => Promise<NotificationWithUser>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Actions spécifiques
  getUserNotifications: (userId: string) => Promise<NotificationWithUser[]>;
  markAsRead: (id: string) => Promise<NotificationWithUser>;
  markAsUnread: (id: string) => Promise<NotificationWithUser>;
  markAllAsRead: (userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  getNotificationStats: () => Promise<any>;
  
  // Utilitaires
  clearError: () => void;
  setCurrentNotification: (notification: NotificationWithUser | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  currentNotification: null,
  userNotifications: [],
  unreadCount: 0,
  notificationStats: null,
  loading: false,
  error: null,

  getNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/`);
      set({ notifications: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des notifications',
        loading: false 
      });
    }
  },

  getNotificationById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${id}`);
      const notification = response.data;
      set({ currentNotification: notification, loading: false });
      return notification;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération de la notification',
        loading: false 
      });
      throw error;
    }
  },

  createNotification: async (notificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/`, notificationData);
      const newNotification = response.data;
      
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        userNotifications: newNotification.userId === state.userNotifications[0]?.userId 
          ? [newNotification, ...state.userNotifications] 
          : state.userNotifications,
        unreadCount: newNotification.userId === state.userNotifications[0]?.userId && !newNotification.isRead
          ? state.unreadCount + 1
          : state.unreadCount,
        loading: false
      }));
      
      return newNotification;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création de la notification',
        loading: false 
      });
      throw error;
    }
  },

  updateNotification: async (id: string, notificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${baseURL}/${id}`, notificationData);
      const updatedNotification = response.data;
      
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        currentNotification: state.currentNotification?.id === id ? updatedNotification : state.currentNotification,
        userNotifications: state.userNotifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        unreadCount: updatedNotification.isRead 
          ? state.unreadCount - (state.userNotifications.find(n => n.id === id)?.isRead ? 0 : 1)
          : state.unreadCount + (state.userNotifications.find(n => n.id === id)?.isRead ? 1 : 0),
        loading: false
      }));
      
      return updatedNotification;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la notification',
        loading: false 
      });
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/${id}`);
      
      set((state) => {
        const deletedNotification = state.userNotifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(notification => notification.id !== id),
          currentNotification: state.currentNotification?.id === id ? null : state.currentNotification,
          userNotifications: state.userNotifications.filter(notification => notification.id !== id),
          unreadCount: deletedNotification && !deletedNotification.isRead 
            ? state.unreadCount - 1 
            : state.unreadCount,
          loading: false
        };
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression de la notification',
        loading: false 
      });
      throw error;
    }
  },

  getUserNotifications: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/user/${userId}`);
      const notifications = response.data;
      
      // Calculer le nombre de notifications non lues
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      
      set({ 
        userNotifications: notifications,
        unreadCount,
        loading: false 
      });
      
      return notifications;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des notifications utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${baseURL}/${id}/read`);
      const updatedNotification = response.data;
      
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        currentNotification: state.currentNotification?.id === id ? updatedNotification : state.currentNotification,
        userNotifications: state.userNotifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
        loading: false
      }));
      
      return updatedNotification;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du marquage comme lu',
        loading: false 
      });
      throw error;
    }
  },

  markAsUnread: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${baseURL}/${id}/unread`);
      const updatedNotification = response.data;
      
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        currentNotification: state.currentNotification?.id === id ? updatedNotification : state.currentNotification,
        userNotifications: state.userNotifications.map(notification => 
          notification.id === id ? updatedNotification : notification
        ),
        unreadCount: state.unreadCount + 1,
        loading: false
      }));
      
      return updatedNotification;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du marquage comme non lu',
        loading: false 
      });
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      await axios.patch(`${baseURL}/read-all`, { userId });
      
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.userId === userId ? { ...notification, isRead: true } : notification
        ),
        userNotifications: state.userNotifications.map(notification => 
          ({ ...notification, isRead: true })
        ),
        unreadCount: 0,
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du marquage de toutes comme lues',
        loading: false 
      });
      throw error;
    }
  },

  getUnreadCount: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/unread/count/${userId}`);
      const count = response.data.count;
      
      set({ unreadCount: count, loading: false });
      return count;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération du nombre de notifications non lues',
        loading: false 
      });
      throw error;
    }
  },

  getNotificationStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/stats/notifications`);
      const stats = response.data;
      set({ notificationStats: stats, loading: false });
      return stats;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setCurrentNotification: (notification) => set({ currentNotification: notification }),
}));

// Types pour les formulaires
export interface CreateNotificationFormData {
  type: NotificationType;
  message: string;
  userId: string;
}