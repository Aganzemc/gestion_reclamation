import React, { useState } from 'react';
import { Ticket, TicketType, TicketPriority, User } from '../../types';
import { mockUsers } from '../../data/mockData';
import { X, Save } from 'lucide-react';

interface TicketFormProps {
  ticket?: Ticket;
  onSave: (ticketData: Partial<Ticket>) => void;
  onCancel: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    titre: ticket?.titre || '',
    description: ticket?.description || '',
    type: ticket?.type || TicketType.INCIDENT,
    priorite: ticket?.priorite || TicketPriority.MOYENNE,
    assignes: ticket?.assignes?.map(a => a.id) || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignedUsers = mockUsers.filter(user => 
      formData.assignes.includes(user.id)
    );

    onSave({
      ...formData,
      assignes: assignedUsers
    });
  };

  const handleAssigneeChange = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignes: checked 
        ? [...prev.assignes, userId]
        : prev.assignes.filter(id => id !== userId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {ticket ? 'Modifier la réclamation' : 'Nouvelle réclamation'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre de la réclamation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée de la réclamation"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={TicketType.QUALITE}>Qualité</option>
                <option value={TicketType.INCIDENT}>Incident</option>
                <option value={TicketType.OPERATIONNEL}>Opérationnel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value as TicketPriority })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={TicketPriority.BASSE}>Basse</option>
                <option value={TicketPriority.MOYENNE}>Moyenne</option>
                <option value={TicketPriority.HAUTE}>Haute</option>
                <option value={TicketPriority.CRITIQUE}>Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assignation
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {mockUsers.map((user) => (
                <label key={user.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.assignes.includes(user.id)}
                    onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                    <div className="text-xs text-gray-500">{user.email} - {user.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;