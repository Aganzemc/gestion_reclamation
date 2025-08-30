import React from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import { mockKPIData } from '../../data/mockData';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const Analytics: React.FC = () => {
  const data = mockKPIData;

  // Données de performance historique
  const performanceData = [
    { periode: 'S1', resolutionTime: 5.2, satisfaction: 78 },
    { periode: 'S2', resolutionTime: 4.8, satisfaction: 82 },
    { periode: 'S3', resolutionTime: 4.5, satisfaction: 85 },
    { periode: 'S4', resolutionTime: 4.2, satisfaction: 88 },
  ];

  // Données de charge de travail
  const workloadData = [
    { jour: 'Lun', nouveau: 12, ferme: 8, encours: 15 },
    { jour: 'Mar', nouveau: 15, ferme: 11, encours: 13 },
    { jour: 'Mer', nouveau: 9, ferme: 14, encours: 12 },
    { jour: 'Jeu', nouveau: 18, ferme: 9, encours: 16 },
    { jour: 'Ven', nouveau: 14, ferme: 16, encours: 10 },
    { jour: 'Sam', nouveau: 6, ferme: 4, encours: 8 },
    { jour: 'Dim', nouveau: 3, ferme: 2, encours: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analyses et Indicateurs</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Exporter le rapport
          </button>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de résolution</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                +2.1% vs mois précédent
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps de première réponse</p>
              <p className="text-2xl font-bold text-gray-900">2.4h</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <TrendingDown size={16} className="mr-1" />
                -15% amélioration
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction client</p>
              <p className="text-2xl font-bold text-gray-900">4.6/5</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                +0.3 points
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets récurrents</p>
              <p className="text-2xl font-bold text-gray-900">12%</p>
              <p className="text-red-600 text-sm flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                +1.2% attention
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance historique */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance par Équipe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Équipe Qualité (QA)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets traités</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temps moyen</span>
                <span className="font-medium">3.2 jours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Satisfaction</span>
                <span className="font-medium">4.7/5</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Équipe Opérationnelle (STO)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets traités</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temps moyen</span>
                <span className="font-medium">4.8 jours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Satisfaction</span>
                <span className="font-medium">4.4/5</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Administration</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets traités</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temps moyen</span>
                <span className="font-medium">2.1 jours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Satisfaction</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommandations d'Amélioration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Optimiser les processus QA</p>
                <p className="text-sm text-gray-600">Les tickets qualité prennent 20% plus de temps que la moyenne</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Former l'équipe STO</p>
                <p className="text-sm text-gray-600">Améliorer les compétences techniques pour réduire les délais</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Automatiser les tâches répétitives</p>
                <p className="text-sm text-gray-600">12% des tickets sont récurrents et pourraient être automatisés</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Améliorer la documentation</p>
                <p className="text-sm text-gray-600">Réduire les demandes de clarification en amont</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;