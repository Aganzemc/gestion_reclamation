// hooks/useAssignments.ts
import { useAssignmentStore } from '../stores/assignmentStore';

export const useAssignments = () => {
  const {
    assignments,
    currentAssignment,
    ticketAssignments,
    userAssignments,
    assignmentStats,
    loading,
    error,
    getAssignments,
    getAssignmentById,
    createAssignment,
    deleteAssignment,
    getTicketAssignments,
    getUserAssignments,
    removeUserFromTicket,
    getAssignmentStats,
    clearError,
    setCurrentAssignment
  } = useAssignmentStore();

  return {
    assignments,
    currentAssignment,
    ticketAssignments,
    userAssignments,
    assignmentStats,
    loading,
    error,
    getAssignments,
    getAssignmentById,
    createAssignment,
    deleteAssignment,
    getTicketAssignments,
    getUserAssignments,
    removeUserFromTicket,
    getAssignmentStats,
    clearError,
    setCurrentAssignment
  };
};