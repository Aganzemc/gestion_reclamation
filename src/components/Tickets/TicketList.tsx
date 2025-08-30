import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketType, TicketPriority } from '../../types';
import { mockTickets } from '../../data/mockData';
import TicketForm from './TicketForm';
import { 
  Plus, 
  Edit, 
  Eye, 
  Filter, 
  Download, 
  Search,
  Calendar
} from 'lucide-react';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: ''
  });

  const handleCreateTicket = (ticketData: Partial<Ticket>) => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      reference: `REC-2024-${String(tickets.length + 1).padStart(3, '0')}`,
      titre: ticketData.titre!,
      description: ticketData.description!,
      type: ticketData.type!,
      priorite: ticketData.priorite!,
      statut: TicketStatus.OUVERT,
      assignes: ticketData.assignes || [],
      createur: tickets[0].createur, // Mock user
      dateCreation: new Date(),
      commentaires: []
    };

    setTickets([newTicket, ...tickets]);
    setShowForm(false);
  };

  const handleEditTicket = (ticketData: Partial<Ticket>) => {
    if (editingTicket) {
      setTickets(tickets.map(ticket => 
        ticket.id === editingTicket.id 
          ? { ...ticket, ...ticketData }
          : ticket
      ));
      setEditingTicket(null);
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.CRITIQUE: return 'bg-red-100 text-red-800';
      case TicketPriority.HAUTE: return 'bg-orange-100 text-orange-800';
      case TicketPriority.MOYENNE: return 'bg-yellow-100 text-yellow-800';
      case TicketPriority.BASSE: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OUVERT: return 'bg-blue-100 text-blue-800';
      case TicketStatus.EN_COURS: return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.CLOTURE: return 'bg-green-100 text-green-800';
    }
  };

  const getTypeColor = (type: TicketType) => {
    switch (type) {
      case TicketType.QUALITE: return 'bg-purple-100 text-purple-800';
      case TicketType.INCIDENT: return 'bg-red-100 text-red-800';
      case TicketType.OPERATIONNEL: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    return (
      (!filters.search || 
        ticket.titre.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.reference.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.status || ticket.statut === filters.status) &&
      (!filters.type || ticket.type === filters.type) &&
      (!filters.priority || ticket.priorite === filters.priority)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Réclamations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Nouvelle réclamation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value={TicketStatus.OUVERT}>Ouvert</option>
            <option value={TicketStatus.EN_COURS}>En cours</option>
            <option value={TicketStatus.CLOTURE}>Clôturé</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value={TicketType.QUALITE}>Qualité</option>
            <option value={TicketType.INCIDENT}>Incident</option>
            <option value={TicketType.OPERATIONNEL}>Opérationnel</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes priorités</option>
            <option value={TicketPriority.CRITIQUE}>Critique</option>
            <option value={TicketPriority.HAUTE}>Haute</option>
            <option value={TicketPriority.MOYENNE}>Moyenne</option>
            <option value={TicketPriority.BASSE}>Basse</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {filteredTickets.length} réclamation{filteredTickets.length > 1 ? 's' : ''} trouvée{filteredTickets.length > 1 ? 's' : ''}
          </div>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {ticket.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {ticket.titre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ticket.type)}`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorite)}`}>
                      {ticket.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.statut)}`}>
                      {ticket.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.assignes.length > 0 
                      ? ticket.assignes.map(a => a.nom).join(', ')
                      : 'Non assigné'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.dateCreation.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingTicket(ticket)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms */}
      {showForm && (
        <TicketForm
          onSave={handleCreateTicket}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTicket && (
        <TicketForm
          ticket={editingTicket}
          onSave={handleEditTicket}
          onCancel={() => setEditingTicket(null)}
        />
      )}
    </div>
  );
};

export default TicketList;