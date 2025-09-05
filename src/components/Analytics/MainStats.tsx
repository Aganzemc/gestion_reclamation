import { Activity, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Ticket } from "../../types/type";
import { getMainStats } from "./getMainStats";

export default function DashboardStats({ tickets }: { tickets: Ticket[] }) {
  const { backlogCount, urgentCount, avgResolution, reassignedRate } =
    getMainStats(tickets);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Backlog actif */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tickets non résolus</p>
            <p className="text-2xl font-bold text-gray-900">{backlogCount}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tickets urgents */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tickets urgents</p>
            <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Temps moyen de résolution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Temps moyen résolution
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {avgResolution}h
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Taux de réassignation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Réassignations</p>
            <p className="text-2xl font-bold text-gray-900">
              {reassignedRate}%
            </p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <RefreshCw className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
