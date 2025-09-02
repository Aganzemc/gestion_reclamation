// stores/userStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { User, UserRole, UserStatus } from '../types/type';

// Configuration Axios de base
// const api = axios.create({
//   baseURL: '/api/users',
// });

const baseURL = "http://localhost:4000/api/users"; 

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  getUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  getUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/`);
      set({ users: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs',
        loading: false 
      });
    }
  },

  getUserById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/`, userData);
      const newUser = response.data;
      
      set((state) => ({
        users: [...state.users, newUser],
        loading: false
      }));
      
      return newUser;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  updateUser: async (id: string, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${baseURL}/${id}`, userData);
      const updatedUser = response.data;
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === id ? updatedUser : user
        ),
        currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
        loading: false
      }));
      
      return updatedUser;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/${id}`);
      
      set((state) => ({
        users: state.users.filter(user => user.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setCurrentUser: (user: User | null) => set({ currentUser: user }),
}));

// Types supplémentaires pour les formulaires
export interface CreateUserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserFormData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}