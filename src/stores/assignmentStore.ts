// stores/assignmentStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { Ticket, TicketAssignment, User } from '../types/type';

// Configuration Axios de base
// const api = axios.create({
//   baseURL: '/api/assignments',
// });

const baseURL = "http://localhost:4000/api/assignments";

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Types étendus pour inclure les relations
export type AssignmentWithRelations = TicketAssignment & {
  user: User;
  ticket: Ticket;
};

interface AssignmentState {
  assignments: AssignmentWithRelations[];
  currentAssignment: AssignmentWithRelations | null;
  ticketAssignments: AssignmentWithRelations[];
  userAssignments: AssignmentWithRelations[];
  assignmentStats: any;
  loading: boolean;
  error: string | null;
  
  // Actions principales pour les assignations
  getAssignments: () => Promise<void>;
  getAssignmentById: (id: string) => Promise<AssignmentWithRelations>;
  createAssignment: (assignmentData: CreateAssignmentFormData) => Promise<AssignmentWithRelations>;
  deleteAssignment: (id: string) => Promise<void>;
  
  // Actions spécifiques
  getTicketAssignments: (ticketId: string) => Promise<AssignmentWithRelations[]>;
  getUserAssignments: (userId: string) => Promise<AssignmentWithRelations[]>;
  removeUserFromTicket: (ticketId: string, userId: string) => Promise<void>;
  getAssignmentStats: () => Promise<any>;
  
  // Utilitaires
  clearError: () => void;
  setCurrentAssignment: (assignment: AssignmentWithRelations | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  currentAssignment: null,
  ticketAssignments: [],
  userAssignments: [],
  assignmentStats: null,
  loading: false,
  error: null,

  getAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/`);
      set({ assignments: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des assignations',
        loading: false 
      });
    }
  },

  getAssignmentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${id}`);
      const assignment = response.data;
      set({ currentAssignment: assignment, loading: false });
      return assignment;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'assignation',
        loading: false 
      });
      throw error;
    }
  },

  createAssignment: async (assignmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/`, assignmentData);
      const newAssignment = response.data;
      
      set((state) => ({
        assignments: [...state.assignments, newAssignment],
        loading: false
      }));
      
      return newAssignment;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création de l\'assignation',
        loading: false 
      });
      throw error;
    }
  },

  deleteAssignment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/${id}`);
      
      set((state) => ({
        assignments: state.assignments.filter(assignment => assignment.id !== id),
        currentAssignment: state.currentAssignment?.id === id ? null : state.currentAssignment,
        ticketAssignments: state.ticketAssignments.filter(assignment => assignment.id !== id),
        userAssignments: state.userAssignments.filter(assignment => assignment.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'assignation',
        loading: false 
      });
      throw error;
    }
  },

  getTicketAssignments: async (ticketId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/ticket/${ticketId}`);
      const assignments = response.data;
      set({ ticketAssignments: assignments, loading: false });
      return assignments;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des assignations du ticket',
        loading: false 
      });
      throw error;
    }
  },

  getUserAssignments: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/user/${userId}`);
      const assignments = response.data;
      set({ userAssignments: assignments, loading: false });
      return assignments;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des assignations de l\'utilisateur',
        loading: false 
      });
      throw error;
    }
  },

  removeUserFromTicket: async (ticketId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/ticket/${ticketId}/user/${userId}`);
      
      set((state) => ({
        assignments: state.assignments.filter(
          assignment => !(assignment.ticketId === ticketId && assignment.userId === userId)
        ),
        ticketAssignments: state.ticketAssignments.filter(
          assignment => assignment.userId !== userId
        ),
        userAssignments: state.userAssignments.filter(
          assignment => assignment.ticketId !== ticketId
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur du ticket',
        loading: false 
      });
      throw error;
    }
  },

  getAssignmentStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/stats/assignments`);
      const stats = response.data;
      set({ assignmentStats: stats, loading: false });
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

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
}));

// Types pour les formulaires
export interface CreateAssignmentFormData {
  ticketId: string;
  userId: string;
}