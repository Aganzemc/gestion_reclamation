import { useEffect, useMemo } from "react";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUser";
import { UserRole } from "../types/type";

export function TeamPerformance() {
  const { getTickets, tickets } = useTickets();
  const { getUsers, users } = useUsers();

  useEffect(() => {
    getTickets();
    getUsers();
  }, []);

  const teamStats = useMemo(() => {
    if (!tickets.length || !users.length) return [];

    // stats initialisés avec les rôles connus
    const stats: Record<string, { total: number; totalTime: number }> = {
      QA: { total: 0, totalTime: 0 },
      STO: { total: 0, totalTime: 0 },
      ADMIN: { total: 0, totalTime: 0 },
      OBSERVER: { total: 0, totalTime: 0 },
    };

    tickets.forEach((ticket) => {
      ticket.assignedTo?.forEach((assignment) => {
        const user = users.find((u) => u.id === assignment.userId);
        if (!user?.role) return;

        const role = user.role as UserRole;

        // si le rôle n'existe pas encore, on l’ajoute
        if (!stats[role]) {
          stats[role] = { total: 0, totalTime: 0 };
        }

        stats[role].total += 1;

        if (ticket.createdAt && ticket.updatedAt) {
          const diffMs =
            new Date(ticket.updatedAt).getTime() -
            new Date(ticket.createdAt).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          stats[role].totalTime += diffDays;
        }
      });
    });

    return Object.entries(stats)
      .filter(([_, data]) => data.total > 0)
      .map(([role, data]) => ({
        role,
        total: data.total,
        avgTime:
          data.total > 0 ? (data.totalTime / data.total).toFixed(1) : "0",
        satisfaction: (Math.random() * 1 + 4).toFixed(1), // placeholder
      }));
  }, [tickets, users]);

  if (!teamStats.length) {
    return <p className="text-gray-500">Aucune donnée disponible</p>;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Performance par Équipe
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamStats.map((team) => (
          <div
            key={team.role}
            className={`p-4 rounded-lg ${
              team.role === "QA"
                ? "bg-blue-50"
                : team.role === "STO"
                ? "bg-green-50"
                : team.role === "ADMIN"
                ? "bg-purple-50"
                : "bg-gray-50"
            }`}
          >
            <h4 className="font-medium mb-2">{team.role}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tickets traités</span>
                <span className="font-medium">{team.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Temps moyen</span>
                <span className="font-medium">{team.avgTime} jours</span>
              </div>
              {/* <div className="flex justify-between">
                <span>Satisfaction</span>
                <span className="font-medium">{team.satisfaction}/5</span>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
