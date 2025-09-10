// stores/authStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { Session, User, UserRole } from '../types/type';
import { prodUrl } from '../services/constants';

// Configuration Axios de base
// const api = axios.create({
//   baseURL: '/api/auth',
// });

const baseURL = `${prodUrl}/api/auth`; 

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Intercepteur pour gérer les tokens expirés
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (refreshToken) {
//           const response = await axios.post('/api/auth/refresh-token', { refreshToken });
//           const { token, refreshToken: newRefreshToken } = response.data;
          
//           localStorage.setItem('authToken', token);
//           localStorage.setItem('refreshToken', newRefreshToken);
          
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         // Si le refresh token échoue, déconnecter l'utilisateur
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

interface AuthState {
  user: User | null;
  userId: string | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions d'authentification
  register: (userData: RegisterFormData) => Promise<User>;
  login: (credentials: LoginFormData) => Promise<{ user: User; token: string; refreshToken: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshTokenFn: () => Promise<{ token: string; refreshToken: string }>;
  verify: () => Promise<boolean>;
  getProfile: () => Promise<User>;
  
  // Utilitaires
  clearError: () => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  getSession: () => Promise<Session>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userId: null,
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/register`, userData);
      const user = response.data;
      
      set({ loading: false });
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      console.log("credentials", credentials)
      const response = await axios.post(`${baseURL}/login`, credentials);
      const { user, token, refreshToken } = response.data.data;
      
      // Stocker les tokens dans le localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ 
        user, 
        token, 
        refreshToken, 
        isAuthenticated: true, 
        loading: false 
      });
      
      return { user, token, refreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${baseURL}/logout`);
      
      // Supprimer les tokens du localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false, 
        loading: false 
      });
    } catch (error: any) {
      // Même en cas d'erreur, on déconnecte localement
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },

  logoutAll: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${baseURL}/logout-all`);
      
      // Supprimer les tokens du localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false, 
        loading: false 
      });
    } catch (error: any) {
      // Même en cas d'erreur, on déconnecte localement
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },

  refreshTokenFn: async () => {
    set({ loading: true, error: null });
    try {
      const refreshToken = get().refreshToken || localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }
      
      const response = await axios.post(`${baseURL}/refresh-token`, { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      // Mettre à jour les tokens dans le localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      set({ 
        token: newToken, 
        refreshToken: newRefreshToken, 
        loading: false 
      });
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du rafraîchissement du token';
      set({ error: errorMessage, loading: false });
      
      // Si le refresh token est invalide, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        get().clearAuth();
      }
      
      throw new Error(errorMessage);
    }
  },

  verify: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/verify`);
      const isValid = response.data.valid;
      
      set({ loading: false });
      return isValid;
    } catch (error: any) {
      set({ loading: false });
      return false;
    }
  },

  getProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/profile`);
      const user = response.data;
      
      set({ user, loading: false });
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération du profil';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),

  setTokens: (token: string, refreshToken: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    set({ 
      user: null, 
      token: null, 
      refreshToken: null, 
      isAuthenticated: false 
    });
  },

  getSession: async () => {
    const token = localStorage.getItem("authToken")
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${token}`);
      const session = response.data;

      set({ 
        userId: session.userId,
        token: session.token, 
        refreshToken: session.refreshToken, 
        loading: false 
      });
      
      set({ loading: false });
      return session;
    } catch (error: any) {
      set({ loading: false });
      return false;
    }
  }

}));

// Types pour les formulaires
export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}