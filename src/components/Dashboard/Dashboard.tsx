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

  // Real percentage changes (current month vs previous month)
  const nowDate = new Date();
  const currentMonth = nowDate.getMonth();
  const currentYear = nowDate.getFullYear();
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  const isSameMonth = (d?: Date) => d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  const isPrevMonth = (d?: Date) => d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;

  const createdAtDate = (t: any) => (t.createdAt ? new Date(t.createdAt) : undefined);
  const updatedAtDate = (t: any) => (t.updatedAt ? new Date(t.updatedAt) : undefined);

  const totalCurrent = tickets.filter(t => isSameMonth(createdAtDate(t))).length;
  const totalPrev = tickets.filter(t => isPrevMonth(createdAtDate(t))).length;

  const inProgressCurrent = tickets.filter(t => t.status === 'IN_PROGRESS' && isSameMonth(createdAtDate(t))).length;
  const inProgressPrev = tickets.filter(t => t.status === 'IN_PROGRESS' && isPrevMonth(createdAtDate(t))).length;

  // Closed counted by the month they were closed (updatedAt when status CLOSED)
  const closedCurrent = tickets.filter(t => t.status === 'CLOSED' && isSameMonth(updatedAtDate(t))).length;
  const closedPrev = tickets.filter(t => t.status === 'CLOSED' && isPrevMonth(updatedAtDate(t))).length;

  function calcChange(currentValue: number, previousValue: number) {
    const denom = previousValue === 0 ? (currentValue === 0 ? 1 : currentValue) : previousValue;
    const pct = Math.round(((currentValue - previousValue) / denom) * 100);
    const type = pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
    const sign = pct > 0 ? '+' : '';
    return { pct, type, label: `${sign}${pct}%` } as const;
  }

  const totalChange = calcChange(totalCurrent, totalPrev); // "ce mois"
  const inProgressChange = calcChange(inProgressCurrent, inProgressPrev); // vs mois précédent
  const closedChange = calcChange(closedCurrent, closedPrev); // "ce mois"

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
          change={`${totalChange.label} ce mois`}
          changeType={totalChange.type as any}
          icon={Ticket}
          color="blue"
        />
        <KPICard
          title="En Cours"
          value={ticketsEnCours}
          change={`${inProgressChange.label} vs mois précédent`}
          changeType={inProgressChange.type as any}
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="Clôturées"
          value={ticketsClotures}
          change={`${closedChange.label} ce mois`}
          changeType={closedChange.type as any}
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
