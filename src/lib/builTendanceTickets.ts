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


export function buildPerformanceData(tickets: Ticket[]) {
  // On regroupe par mois
  const grouped: Record<string, { totalResolution: number; resolvedCount: number; satisfaction: number }> = {};

  tickets.forEach((t) => {
    if (!t.createdAt || !t.updatedAt) return;

    const mois = new Date(t.createdAt).toLocaleString("fr-FR", { month: "short", year: "numeric" });
    const resolutionTime = (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (!grouped[mois]) {
      grouped[mois] = { totalResolution: 0, resolvedCount: 0, satisfaction: 0 };
    }

    grouped[mois].totalResolution += resolutionTime;
    grouped[mois].resolvedCount += 1;

    // Ici j’imagine que tu ajoutes un champ satisfaction plus tard
    grouped[mois].satisfaction += Math.floor(Math.random() * (100 - 70) + 70); // simulate satisfaction 70-100
  });

  return Object.entries(grouped).map(([periode, data]) => ({
    periode,
    resolutionTime: data.resolvedCount > 0 ? +(data.totalResolution / data.resolvedCount).toFixed(1) : 0,
    satisfaction: data.resolvedCount > 0 ? +(data.satisfaction / data.resolvedCount).toFixed(1) : 0,
  }));
}


export function buildWorkloadData(tickets: Ticket[]) {
  const grouped: Record<string, { nouveau: number; encours: number; ferme: number }> = {};

  tickets.forEach((t) => {
    if (!t.createdAt) return;

    const date = new Date(t.createdAt);
    // Trouver la semaine (année + numéro de semaine)
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
    const label = `S${week} ${date.getFullYear()}`;

    if (!grouped[label]) {
      grouped[label] = { nouveau: 0, encours: 0, ferme: 0 };
    }

    if (t.status === "OPEN") {
      grouped[label].nouveau += 1;
    } else if (t.status === "IN_PROGRESS") {
      grouped[label].encours += 1;
    } else if (t.status === "CLOSED") {
      grouped[label].ferme += 1;
    }
  });

  return Object.entries(grouped).map(([jour, data]) => ({
    jour,
    ...data,
  }));
}


interface KPIResult {
  tauxResolution: number;
  evolutionResolution: number; // variation par rapport au mois précédent (%)
}

export function calculerKPIs(tickets: Ticket[]): KPIResult {
  const now = new Date();
  const currentMonth = now.getMonth();
  const previousMonth = (currentMonth - 1 + 12) % 12;

  // Tickets du mois actuel
  const ticketsMoisActuel = tickets.filter(
    (t) => new Date(t.createdAt!).getMonth() === currentMonth
  );
  // Tickets du mois précédent
  const ticketsMoisPrecedent = tickets.filter(
    (t) => new Date(t.createdAt!).getMonth() === previousMonth
  );

  // Taux de résolution = (tickets clôturés / tickets créés) * 100
  const resolusActuel =
    ticketsMoisActuel.filter((t) => t.status === "CLOSED").length || 0;
  const totalActuel = ticketsMoisActuel.length || 1;
  const tauxResolutionActuel = (resolusActuel / totalActuel) * 100;

  const resolusPrecedent =
    ticketsMoisPrecedent.filter((t) => t.status === "CLOSED").length || 0;
  const totalPrecedent = ticketsMoisPrecedent.length || 1;
  const tauxResolutionPrecedent = (resolusPrecedent / totalPrecedent) * 100;

  // Variation en pourcentage
  const evolution =
    tauxResolutionPrecedent === 0
      ? 0
      : ((tauxResolutionActuel - tauxResolutionPrecedent) /
          tauxResolutionPrecedent) *
        100;

  return {
    tauxResolution: Number(tauxResolutionActuel.toFixed(1)),
    evolutionResolution: Number(evolution.toFixed(1)),
  };
}

interface KPIRecurrence {
  taux: number; // en %
  evolution: number; // vs mois précédent
}

export function calculerRecurrence(tickets: Ticket[]): KPIRecurrence {
  const now = new Date();
  const currentMonth = now.getMonth();
  const previousMonth = (currentMonth - 1 + 12) % 12;

  const calculer = (list: Ticket[]) => {
    const grouped = list.reduce<Record<string, number>>((acc, t) => {
      acc[t.createdById] = (acc[t.createdById] || 0) + 1;
      return acc;
    }, {});

    const recurrents = Object.values(grouped).filter((count) => count > 1).length;
    return list.length === 0 ? 0 : (recurrents / list.length) * 100;
  };

  const actuel = calculer(
    tickets.filter((t) => new Date(t.createdAt!).getMonth() === currentMonth)
  );
  const precedent = calculer(
    tickets.filter((t) => new Date(t.createdAt!).getMonth() === previousMonth)
  );

  return {
    taux: Number(actuel.toFixed(1)),
    evolution: Number((actuel - precedent).toFixed(1)),
  };
}
