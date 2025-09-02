// stores/ticketStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { Ticket, TicketStatus, TicketPriority, TicketType, TicketAssignment } from '../types/type';

// Configuration Axios de base
// const api = axios.create({
//   baseURL: '/api/tickets',
// });

const baseURL = "http://localhost:4000/api/tickets"; 

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

interface TicketState {
  tickets: Ticket[];
  currentTicket: (Ticket & { assignedTo: TicketAssignment[] }) | null;
  userTickets: Ticket[];
  loading: boolean;
  error: string | null;
  
  // Actions principales pour les tickets
  getTickets: () => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket & { assignedTo: TicketAssignment[] }>;
  createTicket: (ticketData: CreateTicketFormData) => Promise<Ticket>;
  updateTicket: (id: string, ticketData: Partial<Ticket>) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  getUserTickets: (userId: string) => Promise<void>;
  
  // Actions pour les assignations
  getTicketAssignments: (ticketId: string) => Promise<TicketAssignment[]>;
  createAssignment: (ticketId: string, userId: string) => Promise<TicketAssignment>;
  deleteAssignment: (ticketId: string, assignmentId: string) => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  setCurrentTicket: (ticket: (Ticket & { assignedTo: TicketAssignment[] }) | null) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  currentTicket: null,
  userTickets: [],
  loading: false,
  error: null,

  getTickets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/`);
      set({ tickets: response.data.tickets, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des tickets',
        loading: false 
      });
    }
  },

  getTicketById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${id}`);
      const ticket = response.data;
      set({ currentTicket: ticket, loading: false });
      return ticket;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération du ticket',
        loading: false 
      });
      throw error;
    }
  },

  createTicket: async (ticketData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/`, ticketData);
      const newTicket = response.data;
      
      set((state) => ({
        tickets: [...state.tickets, newTicket],
        loading: false
      }));
      
      return newTicket;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création du ticket',
        loading: false 
      });
      throw error;
    }
  },

  updateTicket: async (id: string, ticketData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${baseURL}/${id}`, ticketData);
      const updatedTicket = response.data;
      
      set((state) => ({
        tickets: state.tickets.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        ),
        currentTicket: state.currentTicket?.id === id ? updatedTicket : state.currentTicket,
        userTickets: state.userTickets.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        ),
        loading: false
      }));
      
      return updatedTicket;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du ticket',
        loading: false 
      });
      throw error;
    }
  },

  deleteTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/${id}`);
      
      set((state) => ({
        tickets: state.tickets.filter(ticket => ticket.id !== id),
        currentTicket: state.currentTicket?.id === id ? null : state.currentTicket,
        userTickets: state.userTickets.filter(ticket => ticket.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression du ticket',
        loading: false 
      });
      throw error;
    }
  },

  updateTicketStatus: async (id: string, status: TicketStatus) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${baseURL}/${id}/status`, { status });
      const updatedTicket = response.data;
      
      set((state) => ({
        tickets: state.tickets.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        ),
        currentTicket: state.currentTicket?.id === id ? updatedTicket : state.currentTicket,
        userTickets: state.userTickets.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        ),
        loading: false
      }));
      
      return updatedTicket;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du statut',
        loading: false 
      });
      throw error;
    }
  },

  getUserTickets: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/user/${userId}`);
      set({ userTickets: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des tickets utilisateur',
        loading: false 
      });
    }
  },

  getTicketAssignments: async (ticketId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${baseURL}/${ticketId}/assignments`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la récupération des assignations',
        loading: false 
      });
      throw error;
    }
  },

  createAssignment: async (ticketId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${baseURL}/${ticketId}/assignments`, { userId });
      const newAssignment = response.data;
      
      // Mettre à jour le ticket courant avec la nouvelle assignation
      set((state) => {
        if (state.currentTicket?.id === ticketId) {
          return {
            currentTicket: {
              ...state.currentTicket,
              assignedTo: [...state.currentTicket.assignedTo, newAssignment]
            },
            loading: false
          };
        }
        return { loading: false };
      });
      
      return newAssignment;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création de l\'assignation',
        loading: false 
      });
      throw error;
    }
  },

  deleteAssignment: async (ticketId: string, assignmentId: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseURL}/${ticketId}/assignments/${assignmentId}`);
      
      // Mettre à jour le ticket courant en supprimant l'assignation
      set((state) => {
        if (state.currentTicket?.id === ticketId) {
          return {
            currentTicket: {
              ...state.currentTicket,
              assignedTo: state.currentTicket.assignedTo.filter(
                (assignment: any) => assignment.id !== assignmentId
              )
            },
            loading: false
          };
        }
        return { loading: false };
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'assignation',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
}));

// Types pour les formulaires
export interface CreateTicketFormData {
  title: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  createdById: string;
}