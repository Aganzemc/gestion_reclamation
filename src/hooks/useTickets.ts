// hooks/useTickets.ts
import { useTicketStore } from '../stores/ticketStore';

export const useTickets = () => {
  const {
    tickets,
    ticket,
    currentTicket,
    userTickets,
    loading,
    error,
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
    getUserTickets,
    getTicketAssignments,
    createAssignment,
    deleteAssignment,
    clearError,
    setCurrentTicket
  } = useTicketStore();

  return {
    tickets,
    ticket,
    currentTicket,
    userTickets,
    loading,
    error,
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
    getUserTickets,
    getTicketAssignments,
    createAssignment,
    deleteAssignment,
    clearError,
    setCurrentTicket
  };
};