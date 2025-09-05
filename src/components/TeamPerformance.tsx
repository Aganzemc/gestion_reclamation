import { useEffect } from "react";
import { useTickets } from "../hooks/useTickets";
import { TicketPriority, TicketStatus } from "../types/type";
import { TicketStats } from "./TicketStats";

export function TeamPerformance() {
  const { getTickets, tickets } = useTickets();

  useEffect(() => {
    getTickets();
  }, []);

  const now = new Date();

  const stats = {
    averageResolutionTime: (() => {
      const resolved = tickets.filter(t =>
        [TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(t.status!)
      );
      if (resolved.length === 0) return 0;

      const totalMs = resolved.reduce((acc, t) => {
        if (!t.createdAt || !t.updatedAt) return acc;
        return acc + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
      }, 0);

      return Math.round(totalMs / resolved.length / (1000 * 60 * 60)); // en heures
    })(),

    overdue: tickets.filter(t => {
      if (!t.createdAt) return false;
      const diffDays = (now.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && [TicketStatus.OPEN, TicketStatus.IN_PROGRESS].includes(t.status!);
    }).length,

    unassigned: tickets.filter(t => !t.assignedTo || t.assignedTo.length === 0).length,

    byPriority: {
      low: tickets.filter(t => t.priority === TicketPriority.LOW).length,
      medium: tickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
      high: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
      urgent: tickets.filter(t => t.priority === TicketPriority.URGENT).length,
    },

    byStatus: {
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    }
  };

  return (
    <><TicketStats stats={stats} /></>
  );
}
