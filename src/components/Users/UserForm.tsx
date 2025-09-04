import React, { useState } from 'react';
import { Edit, Plus, Save } from 'lucide-react';
import { User, UserRole, UserStatus } from '../../types/type';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

interface UserFormProps {
  user?: User;
  onSave: (userData: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || UserRole.OBSERVER,
    status: user?.status ?? UserStatus.ACTIVE,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      email: formData.email,
      password: "12345678",
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {user ? (
          <button
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit size={16} />
          </button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={16} />
            <span>Nouvel utilisateur</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="h-[450px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postnom *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Post nom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.QA}>QA</option>
              <option value={UserRole.STO}>STO</option>
              <option value={UserRole.OBSERVER}>Observateur</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="status" className="mb-1 text-sm text-gray-700">
              Statut de l’utilisateur
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as UserStatus })
              }
              className="w-full rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(UserStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Enregistrer</span>
              </button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>



  );
};

export default UserForm;
