import React, { useEffect, useState } from 'react';
import { Ticket, TicketType, TicketPriority, TicketStatus } from '../../types/type';
import { Save, Plus, Edit } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useAssignments } from '../../hooks/useAssignments';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

interface TicketFormProps {
  ticket?: Ticket;
  onSave: (ticketData: Ticket) => void;
  onclick?: () => void
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onSave, onclick }) => {
  const { users, getUsers } = useUserStore()
  const { addUser, removeUser, assignedUsers, } = useAssignments()
  const { user } = useAuth()

  useEffect(() => {
    getUsers()
  }, [])

  const [formData, setFormData] = useState({
    id: ticket?.id,
    title: ticket?.title ?? "",
    description: ticket?.description ?? null,
    status: ticket?.status ?? TicketStatus.IN_PROGRESS, // valeur par défaut
    priority: ticket?.priority ?? TicketPriority.MEDIUM, // valeur par défaut
    type: ticket?.type ?? TicketType.INCIDENT, // valeur par défaut
    createdById: ticket?.createdById ?? "",
    createdAt: ticket?.startDate ?? ticket?.createdAt ?? undefined,
    updatedAt: ticket?.endDate ?? ticket?.updatedAt ?? undefined,
    assignedTo: ticket?.assignedTo
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      type: formData.type,
      status: formData.status,
      createdById: formData.createdById,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
    });
  };



  const handleAssigneeChange = (userId: string, checked: boolean) => {
    if (checked) {
      addUser(userId);
    } else {
      removeUser(userId);
    }
  };

 const operatingTeam = users.filter(user => user.role === "STO") || []


  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {ticket ? (
            <button
              className="text-blue-600 hover:text-blue-700"
              onClick={onclick}
            >
              <Edit size={16} />
            </button>
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus size={16} />
              <span>Nouvelle réclamation</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="h-[520px] overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date début
                </label>
                <input
                  type="date"
                  value={formData.createdAt ? new Date(formData.createdAt).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setFormData({ ...formData, createdAt: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date fin
                </label>
                <input
                  type="date"
                  value={formData.updatedAt ? new Date(formData.updatedAt).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setFormData({ ...formData, updatedAt: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={TicketStatus.OPEN}>Ouvert</option>
                <option value={TicketStatus.IN_PROGRESS}>En cours</option>
                <option value={TicketStatus.CLOSED}>Terminé</option>
              </select>
            </div>

            {user?.role === "QA" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assignation
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {operatingTeam.map((user) => {
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
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <DialogClose asChild>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </DialogClose>


              <DialogClose asChild>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span className='text-gray-100'>Enregistrer</span>
                </button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog >
    </>
  );
};

export default TicketForm;
