import React, { useEffect, useState } from 'react';
import {Shield, Users, Search, Eye } from 'lucide-react';
import UserForm from './UserForm';
import { useUsers } from '../../hooks/useUser';
import { User, UserRole, UserStatus } from '../../types/type';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { format } from "date-fns";
import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC = () => {
  const { users, getUsers, createUser, updateUser } = useUsers()
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [_showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const handleAddUser = (newUser: User) => {
    createUser(newUser);
    setShowForm(false);
  };

  useEffect(() => {
    getUsers();
  }, [])


  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.QA: return 'bg-blue-100 text-blue-800';
      case UserRole.STO: return 'bg-green-100 text-green-800';
      case UserRole.OBSERVER: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <Shield size={16} />;
      case UserRole.QA: return <Users size={16} />;
      case UserRole.STO: return <Users size={16} />;
      case UserRole.OBSERVER: return <Users size={16} />;
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      (!searchTerm ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterRole || user.role === filterRole)
    );
  });

  const toggleUserStatus = (userId: string) => {
    const currentStatus = users.find(u => u.id === userId)?.status;
    updateUser(userId, {
      status: currentStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
    });
  };

  const handleUserUpdate = async (EditeUser: User) => {
    if (editingUser) {
      await updateUser(editingUser.id!, EditeUser);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        {
          (currentUser?.role === "ADMIN") && (
            <UserForm
              onSave={handleAddUser}
            />
          )
        }
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === UserRole.ADMIN).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value={UserRole.ADMIN}>Administrateur</option>
            <option value={UserRole.QA}>Équipe Qualité</option>
            <option value={UserRole.STO}>Équipe Opérationnelle</option>
            <option value={UserRole.OBSERVER}>Observateur</option>
          </select>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName?.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role!)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role!)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id!)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === "ACTIVE"
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {user.status ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {
                        currentUser?.role === "ADMIN" && (
                          <UserForm
                            user={user}
                            onSave={handleUserUpdate}
                          />
                        )
                      }

                      <Drawer>
                        <DrawerTrigger asChild>
                          <button onClick={() => setEditingUser(user)} className="text-gray-600 hover:text-gray-700">
                            <Eye size={16} />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="min-h-[85%] max-h-[85%] overflow-auto bg-white p-6 space-y-6">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h2>
                          </div>

                          {editingUser && (
                            <>
                              {/* Informations principales */}
                              <div className="space-y-4 border-b border-gray-200 pb-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <span className="font-semibold text-gray-700">Nom complet:</span>
                                  <span className="text-gray-900">{editingUser.firstName} {editingUser.lastName || '-'}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <span className="font-semibold text-gray-700">Email:</span>
                                  <span className="text-gray-900">{editingUser.email}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <span className="font-semibold text-gray-700">Rôle:</span>
                                  <span className="text-gray-900">{editingUser.role || 'Non défini'}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <span className="font-semibold text-gray-700">Statut:</span>
                                  <span className="text-gray-900">{editingUser.status || 'Inconnu'}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <span className="font-semibold text-gray-700">Créé le:</span>
                                  <span className="text-gray-900">{editingUser.createdAt ? format(new Date(editingUser.createdAt), 'dd/MM/yyyy') : '-'}</span>
                                </div>
                              </div>

                              {/* Tickets créés */}
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Tickets créés</h3>
                                {editingUser.tickets && editingUser.tickets.length > 0 ? (
                                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {editingUser.tickets.map(ticket => (
                                      <li key={ticket.id} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                        <div className="font-semibold text-gray-800">{ticket.title}</div>
                                        <div className="text-gray-600 text-sm truncate">{ticket.description || 'Aucune description'}</div>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                          <span>{ticket.type || '-'}</span>
                                          <span>{ticket.priority || '-'}</span>
                                          <span>{ticket.status || '-'}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">Aucun ticket créé</p>
                                )}
                              </div>

                              {/* Tickets assignés */}
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Tickets assignés</h3>
                                {editingUser.assignedTickets && editingUser.assignedTickets.length > 0 ? (
                                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {editingUser.assignedTickets.map(assign => (
                                      <li key={assign.id} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                        <div className="font-semibold text-gray-800">{assign.ticket?.title || '-'}</div>
                                        <div className="text-gray-600 text-sm truncate">{assign.ticket?.description || 'Aucune description'}</div>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                          <span>{assign.ticket?.type || '-'}</span>
                                          <span>{assign.ticket?.priority || '-'}</span>
                                          <span>{assign.ticket?.status || '-'}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">Aucun ticket assigné</p>
                                )}
                              </div>
                            </>
                          )}
                        </DrawerContent>
                      </Drawer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default UserManagement;