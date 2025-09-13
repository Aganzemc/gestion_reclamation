import React, { useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useTickets } from '../../hooks/useTickets';
import { buildPerformanceData, buildWorkloadData } from '../../lib/builTendanceTickets';
import { TeamPerformance } from '../TeamPerformance';
import DashboardStats from './MainStats';


const Analytics: React.FC = () => {
  const { getTickets, tickets } = useTickets()
  useEffect(() => {
    getTickets()
  }, [])


  // Données de performance historique
  const performanceData = buildPerformanceData(tickets);

  // Données de charge de travail
  const workloadData = buildWorkloadData(tickets);

  // const { tauxResolution, evolutionResolution } = calculerKPIs(tickets);
  // const { taux, evolution } = calculerRecurrence(tickets);


  return (
    <div className="space-y-6 w-full pb-6">
      <div className="flex items-center justify-between">
        <div className='w-full bg-gray-900 rounded p-6 mt-4 mb-2'>
          <h1 className="text-2xl font-bold text-gray-100 uppercase">Analyses et Indicateurs</h1>
        </div>
        <div className="flex space-x-2">
          {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Exporter le rapport
          </button> */}
        </div>
      </div>

      {/* Indicateurs de performance */}
      <DashboardStats tickets={tickets}/>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance historique */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des Performances
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periode" stroke="#666" />
              <YAxis yAxisId="left" stroke="#666" />
              <YAxis yAxisId="right" orientation="right" stroke="#666" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="resolutionTime"
                stroke="#EF4444"
                strokeWidth={3}
                name="Temps résolution (jours)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="satisfaction"
                stroke="#10B981"
                strokeWidth={3}
                name="Satisfaction (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charge de travail hebdomadaire */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Charge de Travail Hebdomadaire
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="nouveau"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Nouveaux"
              />
              <Area
                type="monotone"
                dataKey="encours"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="En cours"
              />
              <Area
                type="monotone"
                dataKey="ferme"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Fermés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analyse par équipe */}
      
      <TeamPerformance/>
    </div>
  );
};

export default Analytics;
