import { Ticket, TicketType } from "../types/type";

export const buildTendanceMensuelle = (tickets: Ticket[]) => {
  // créer un objet { "2025-01": count, "2025-02": count, ... }
  const grouped: Record<string, number> = {};

  tickets.forEach((ticket) => {
    if (!ticket.createdAt) return;

    const date = new Date(ticket.createdAt);
    const mois = date.toLocaleString("fr-FR", {
      month: "short",
      year: "numeric",
    });

    grouped[mois] = (grouped[mois] || 0) + 1;
  });

  // transformer en tableau [{ mois: "janv. 2025", tickets: 5 }, ...]
  return Object.entries(grouped).map(([mois, count]) => ({
    mois,
    tickets: count,
  }));
};

export const buildRepartitionType = (tickets: Ticket[]) => {
  const grouped: Record<TicketType, number> = {
    [TicketType.INCIDENT]: 0,
    [TicketType.QUALITE]: 0,
    [TicketType.OPERATIONNEL]: 0,
  };

  tickets.forEach((ticket) => {
    if (ticket.type) {
      grouped[ticket.type] = (grouped[ticket.type] || 0) + 1;
    }
  });

  return Object.entries(grouped).map(([name, count]) => ({
    name,
    count,
  }));
};


export const buildTicketsParAgent = (tickets: Ticket[]) => {
  const counter: Record<string, number> = {};

  tickets.forEach((ticket) => {
    ticket.assignedTo?.forEach((assignment) => {
      const user = assignment.user;
      if (user) {
        counter[user.firstName + " " + (user.lastName ?? "")] =
          (counter[user.firstName + " " + (user.lastName ?? "")] || 0) + 1;
      }
    });
  });

  return Object.entries(counter).map(([agent, count]) => ({
    agent,
    count,
  }));
};

