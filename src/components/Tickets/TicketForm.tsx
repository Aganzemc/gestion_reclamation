import React, { useEffect, useState } from 'react';
import { Ticket, TicketType, TicketPriority, TicketStatus } from '../../types/type';
import { X, Save } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useAssignments } from '../../hooks/useAssignments';
import { DialogClose } from '../ui/dialog';

interface TicketFormProps {
  ticket?: Ticket;
  onSave: (ticketData: Ticket) => void;
  onCancel: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onSave, onCancel }) => {
  const { users, getUsers } = useUserStore()
  const { addUser, removeUser, assignedUsers, } = useAssignments()

  useEffect(() => {
    getUsers()
  }, [users])

  const [formData, setFormData] = useState({
    id: ticket?.id,
    title: ticket?.title ?? "",
    description: ticket?.description ?? null,
    status: ticket?.status ?? TicketStatus.IN_PROGRESS, // valeur par défaut
    priority: ticket?.priority ?? TicketPriority.MEDIUM, // valeur par défaut
    type: ticket?.type ?? TicketType.INCIDENT, // valeur par défaut
    createdById: ticket?.createdById ?? "",
    createdAt: ticket?.createdAt,
    updatedAt: ticket?.updatedAt,
    assignedTo: ticket?.assignedTo
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      type: formData.type,
      createdById: formData.createdById,
    });
  };



  const handleAssigneeChange = (userId: string, checked: boolean) => {
    if (checked) {
      addUser(userId);
    } else {
      removeUser(userId);
    }
  };




  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          value={formData.description!}
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
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={TicketPriority.LOW}>Basse</option>
            <option value={TicketPriority.MEDIUM}>Moyenne</option>
            <option value={TicketPriority.HIGH}>Haute</option>
            <option value={TicketPriority.URGENT}>Critique</option>
          </select>
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Assignation
        </label>
        <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {users.map((user) => {
            const isChecked =
              (assignedUsers.some((a) => a.userId === user.id) ||
                ticket?.assignedTo?.some((a) => a.userId === user.id)) ||
              false;

            return (
              <label
                key={user.id}
                className="flex items-center gap-3 py-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    handleAssigneeChange(user.id!, e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.email} — {user.role}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>



      <div className="flex justify-end space-x-3 pt-6 border-t">
        <DialogClose asChild>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </DialogClose>


        <DialogClose asChild>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Enregistrer</span>
          </button>
        </DialogClose>
      </div>
    </form>
  );
};

export default TicketForm;
