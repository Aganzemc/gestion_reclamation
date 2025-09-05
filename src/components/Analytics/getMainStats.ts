import { Ticket, TicketPriority, TicketStatus } from "../../types/type";


// Fonction de calcul des stats
export const getMainStats = (tickets: Ticket[]) => {

  // 1. Backlog actif (tickets ouverts ou en cours)
  const backlog = tickets.filter(
    (t) =>
      t.status === TicketStatus.OPEN ||
      t.status === TicketStatus.IN_PROGRESS
  );
  const backlogCount = backlog.length;

  // 2. Tickets urgents
  const urgentCount = tickets.filter(
    (t) => t.priority === TicketPriority.URGENT
  ).length;

  // 3. Temps moyen de résolution (en heures)
  const resolved = tickets.filter((t) =>
    [TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(t.status!)
  );
  const avgResolution =
    resolved.length > 0
      ? Math.round(
          resolved.reduce((acc, t) => {
            if (!t.createdAt || !t.updatedAt) return acc;
            return (
              acc +
              (new Date(t.updatedAt).getTime() -
                new Date(t.createdAt).getTime())
            );
          }, 0) /
            resolved.length /
            (1000 * 60 * 60)
        )
      : 0;

  // 4. Taux de réassignation
  // On considère qu’un ticket a été réassigné si assignedTo > 1 personne
  const reassignedTickets = tickets.filter(
    (t) => t.assignedTo && t.assignedTo.length > 1
  );
  const reassignedRate =
    tickets.length > 0
      ? Math.round((reassignedTickets.length / tickets.length) * 100)
      : 0;

  return {
    backlogCount,
    urgentCount,
    avgResolution,
    reassignedRate,
  };
};
