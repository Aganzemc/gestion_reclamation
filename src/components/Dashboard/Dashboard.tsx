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
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { buildRepartitionType, buildTendanceMensuelle, buildTicketsParAgent } from '../../lib/builTendanceTickets';
import { TicketPriority, TicketStatus, TicketType } from '../../types/type';
import ActionProgressTable from './ActionProgressTable';

const Dashboard: React.FC = () => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const { getTickets, tickets } = useTickets();

  const totalTickets = tickets.length;
  const ticketsEnCours = tickets.filter(ticket => ticket.status === 'IN_PROGRESS').length;
  const ticketsClotures = tickets.filter(ticket => ticket.status === 'CLOSED').length;

  // utilisation
  const tendanceMensuelle = buildTendanceMensuelle(tickets);
  const repartitionType = buildRepartitionType(tickets);
  const ticketsParAgent = buildTicketsParAgent(tickets);

  const stats = {
    urgent: tickets.filter(t => t.priority === TicketPriority.URGENT).length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
    inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
    closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    rejected: tickets.filter(t => t.status === TicketStatus.REJECTED).length,
    incident: tickets.filter(t => t.type === TicketType.INCIDENT).length,
    qualite: tickets.filter(t => t.type === TicketType.QUALITE).length,
    operationnel: tickets.filter(t => t.type === TicketType.OPERATIONNEL).length,
    unassigned: tickets.filter(t => !t.assignedTo || t.assignedTo.length === 0).length,
  };

  // KPIs: On-time vs Late
  const now = new Date();
  const ticketsWithDue = tickets.filter(t => t.endDate);
  const onTimeCount = ticketsWithDue.filter(t => {
    const due = new Date(t.endDate!);
    if (t.status === TicketStatus.CLOSED || t.status === TicketStatus.RESOLVED) {
      const done = t.updatedAt ? new Date(t.updatedAt) : now;
      return done <= due;
    }
    return now <= due; // pas encore dû
  }).length;
  const lateCount = ticketsWithDue.filter(t => {
    const due = new Date(t.endDate!);
    if (t.status === TicketStatus.CLOSED || t.status === TicketStatus.RESOLVED) {
      const done = t.updatedAt ? new Date(t.updatedAt) : now;
      return done > due;
    }
    return now > due;
  }).length;
  const denom = ticketsWithDue.length || 1;
  const onTimePct = Math.round((onTimeCount / denom) * 100);
  const latePct = Math.round((lateCount / denom) * 100);

  useEffect(() => {
    getTickets();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 space-y-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between w-full p-6 bg-gray-900 rounded">
        <h1 className="text-2xl font-bold text-gray-100 uppercase">Tableau de bord</h1>
        <div className="text-sm font-semibold text-gray-100">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Tickets"
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
          title="Non Assignés"
          value={`${stats.unassigned}`}
          change=""
          changeType="neutral"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* KPI On-time vs Late */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <KPICard
          title="% Fait en temps"
          value={`${onTimePct}%`}
          change={`${onTimeCount}/${ticketsWithDue.length || 0}`}
          changeType="positive"
          icon={ShieldCheck}
          color="green"
        />
        <KPICard
          title="% En retard"
          value={`${latePct}%`}
          change={`${lateCount}/${ticketsWithDue.length || 0}`}
          changeType="negative"
          icon={AlertTriangle}
          color="red"
        />
      </div>
      {/* Tableau de suivi */}
      <ActionProgressTable />
      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
        {/* Tendance mensuelle */}
        <div className="p-6 bg-white shadow-lg rounded-2xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Évolution Mensuelle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendanceMensuelle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" />
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
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="p-6 bg-white shadow-lg rounded-2xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
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
                outerRadius={90}
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
      <div className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Charge de Travail par Agent
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ticketsParAgent}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="agent" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-6 border border-red-200 shadow-sm bg-red-50 rounded-2xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Tickets Critiques</h4>
              <p className="text-sm text-red-700">
                {stats.urgent} tickets urgents nécessitent une attention immédiate
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border border-yellow-200 shadow-sm bg-yellow-50 rounded-2xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">Tickets Incidents</h4>
              <p className="text-sm text-yellow-700">
                {stats.incident} tickets liés aux incidents
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border border-blue-200 shadow-sm bg-blue-50 rounded-2xl">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Tickets Qualité</h4>
              <p className="text-sm text-blue-700">
                {stats.qualite} tickets liés à la qualité
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
