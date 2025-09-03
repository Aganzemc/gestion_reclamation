import React, { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import KPICard from './KPICard';
import { mockKPIData } from '../../data/mockData';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { buildRepartitionType, buildTendanceMensuelle, buildTicketsParAgent } from '../../lib/builTendanceTickets';

const Dashboard: React.FC = () => {
  const data = mockKPIData;


  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const { getTickets, tickets } = useTickets()

  const totalTickets = tickets.length;
  const ticketsEnCours = tickets.filter(ticket => ticket.status === 'IN_PROGRESS').length;
  const ticketsClotures = tickets.filter(ticket => ticket.status === 'CLOSED').length;

  // utilisation
  const tendanceMensuelle = buildTendanceMensuelle(tickets);
  const repartitionType = buildRepartitionType(tickets);
  const ticketsParAgent = buildTicketsParAgent(tickets);

  useEffect(() => {
    getTickets()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Réclamations"
          value={totalTickets}
          change="+12% ce mois"
          changeType="positive"
          icon={Ticket}
          color="blue"
        />
        <KPICard
          title="En Cours"
          value={ticketsEnCours}
          change="-5% vs mois précédent"
          changeType="negative"
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="Clôturées"
          value={ticketsClotures}
          change="+18% ce mois"
          changeType="positive"
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Temps Moyen (jours)"
          value={data.tempsTraitement}
          change="Stable"
          changeType="neutral"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendance mensuelle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution Mensuelle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendanceMensuelle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition par Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repartitionType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent! * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {repartitionType.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tickets par agent */}
      {/* Tickets par agent */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Charge de Travail par Agent
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ticketsParAgent}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="agent" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Tickets Critiques</h4>
              <p className="text-red-700 text-sm">3 tickets critiques nécessitent une attention immédiate</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">En Retard</h4>
              <p className="text-yellow-700 text-sm">7 tickets dépassent le délai prévu</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Performance</h4>
              <p className="text-blue-700 text-sm">Amélioration de 15% ce mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// import { AppSidebar } from "../../components/app-sidebar"
// import { ChartAreaInteractive } from "../../components/chart-area-interactive"
// import { DataTable } from "../../components/data-table"
// import { SectionCards } from "../../components/section-cards"
// import { SiteHeader } from "../../components/site-header"
// import {
//   SidebarInset,
//   SidebarProvider,
// } from "../../components/ui/sidebar"

// import data from "./data.json"

// export default function Page() {
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "calc(var(--spacing) * 72)",
//           "--header-height": "calc(var(--spacing) * 12)",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="flex flex-1 flex-col">
//           <div className="@container/main flex flex-1 flex-col gap-2">
//             <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//               <SectionCards />
//               <div className="px-4 lg:px-6">
//                 <ChartAreaInteractive />
//               </div>
//               <DataTable data={data} />
//             </div>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }
