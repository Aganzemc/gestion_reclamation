import { AlertTriangle, Clock, Users } from "lucide-react"

interface StatsProps {
  stats: {
    averageResolutionTime: number
    overdue: number
    unassigned: number
    byPriority: {
      low: number
      medium: number
      high: number
      urgent: number
    }
    byStatus: {
      open: number
      inProgress: number
      closed: number
    }
  }
}

export function TicketStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Temps moyen de résolution */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-purple-600" />
          <div>
            <h4 className="font-semibold text-purple-900">Temps moyen de résolution</h4>
            <p className="text-purple-700 text-sm">
              {stats.averageResolutionTime} h en moyenne
            </p>
          </div>
        </div>
      </div>

      {/* Tickets en retard */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-900">Tickets en retard</h4>
            <p className="text-red-700 text-sm">
              {stats.overdue} tickets ouverts depuis +7 jours
            </p>
          </div>
        </div>
      </div>

      {/* Tickets non assignés */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-yellow-600" />
          <div>
            <h4 className="font-semibold text-yellow-900">Tickets non assignés</h4>
            <p className="text-yellow-700 text-sm">
              {stats.unassigned} tickets sans responsable
            </p>
          </div>
        </div>
      </div>

      {/* Répartition par priorité */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:col-span-2">
        <h4 className="font-semibold text-blue-900 mb-3">Répartition par priorité</h4>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700">
          <li>Basse : {stats.byPriority.low}</li>
          <li>Moyenne : {stats.byPriority.medium}</li>
          <li>Haute : {stats.byPriority.high}</li>
          <li>Critique : {stats.byPriority.urgent}</li>
        </ul>
      </div>

      {/* Répartition par statut */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 md:col-span-3">
        <h4 className="font-semibold text-green-900 mb-3">Répartition par statut</h4>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-green-700">
          <li>Ouverts : {stats.byStatus.open}</li>
          <li>En cours : {stats.byStatus.inProgress}</li>
          <li>Clôturés : {stats.byStatus.closed}</li>
        </ul>
      </div>
    </div>
  )
}