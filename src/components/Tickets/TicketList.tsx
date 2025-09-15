import React, { useEffect, useState } from 'react';
import { Ticket, TicketStatus, TicketType, TicketPriority } from '../../types/type';
import TicketForm from './TicketForm';
import {
  Eye,
  Download,
  Search,
  Check,
  Trash2,
} from 'lucide-react';
import { useTicketStore } from '../../stores/ticketStore';
import { useAuthentication } from '../../hooks/useAuth';
import { useAssignments } from '../../hooks/useAssignments';
import { Button } from '../ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { exportTicketsToExcel } from '../../lib/excel';
import TicketsPDF from '../../lib/pdf';
import { DownLoadPdf } from '../../lib/downloadPdf';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { format } from "date-fns";
import { useAuth } from '../../context/AuthContext';
import { useAssignmentStore } from '../../stores/assignmentStore';


const TicketList: React.FC = () => {
  const { tickets, userTickets, getTickets, createTicket, updateTicket, getUserTickets, deleteTicket, updateTicketStatus } = useTicketStore()
  const { getSession, userId } = useAuthentication()
  // const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const { getUserAssignments, userAssignments } = useAssignmentStore()
  const { assignedUsers, createAssignment, reset } = useAssignments()
  const [_showForm, setShowForm] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: ''
  });

  const onClickDownload = (tickets: Ticket[]) => {
    DownLoadPdf({
      pdfElement: <TicketsPDF tickets={tickets} />,
      filename: `ticket.pdf`,
    });
  };

  const onValidateTicket = async (ticketId: string) => {
    await updateTicketStatus(ticketId, TicketStatus.CLOSED)
    await getTickets()
  }

  const onDeleteTicket = async (ticketId: string) => {
    await deleteTicket(ticketId)
    await getTickets()
  }



  useEffect(() => {
    getTickets()
    getSession()
    getUserTickets(user?.id!)
    getUserAssignments(user?.id!)
  }, [])

  const assignedTickets = Array.isArray(userAssignments)
    ? userAssignments.map(ass => ass.ticket)
    : [];


  const handleCreateTicket = async (ticketData: Ticket) => {
    console.log("my data", ticketData)
    const newTicket = await createTicket({
      title: ticketData.title,
      description: ticketData.description ?? undefined,
      priority: ticketData.priority,
      type: ticketData.type,
      status: ticketData.status,
      createdById: userId!,
      startDate: ticketData.startDate,
      endDate: ticketData.endDate,
    })

    assignedUsers.forEach(user => {
      createAssignment({
        ticketId: newTicket.id!,
        userId: user.userId
      })
    })
    reset()
    setShowForm(false);
  };

  const handleEditTicket = async (ticketData: Ticket) => {
    if (editingTicket) {
      const updatedTicket = await updateTicket(editingTicket.id!, {
        title: ticketData.title,
        description: ticketData.description ?? undefined,
        priority: ticketData.priority,
        type: ticketData.type,
        status: ticketData.status,
        startDate: ticketData.startDate,
        endDate: ticketData.endDate,
      })
      assignedUsers.forEach(user => {
        createAssignment({
          ticketId: updatedTicket.id!,
          userId: user.userId
        })
      })
      reset()
      setEditingTicket(null);
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.URGENT: return 'bg-red-100 text-red-800';
      case TicketPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case TicketPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TicketPriority.LOW: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-blue-100 text-blue-800';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.CLOSED: return 'bg-green-100 text-green-800';
    }
  };

  const getTypeColor = (type: TicketType) => {
    switch (type) {
      case TicketType.QUALITE: return 'bg-purple-100 text-purple-800';
      case TicketType.INCIDENT: return 'bg-red-100 text-red-800';
      case TicketType.OPERATIONNEL: return 'bg-blue-100 text-blue-800';
    }
  };

  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>(assignedTickets)
  // console.log("tickets", tickets)
  // console.log("ass tickets", assignedTickets)
  // console.log("displayed tickets", displayedTickets)
  // console.log("user tickets", userTickets)
  const filteredTickets = Array.isArray(displayedTickets)
    ? displayedTickets.filter(ticket => {
      return (
        (!filters.search ||
          ticket.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          String(ticket.id)?.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.status || ticket.status?.toLowerCase() === filters.status.toLowerCase()) &&
        (!filters.type || ticket.type?.toLowerCase() === filters.type.toLowerCase()) &&
        (!filters.priority || ticket.priority?.toLowerCase() === filters.priority.toLowerCase())
      );
    })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 rounded bg-gray-900 mt-6">
        <h1 className="text-2xl font-bold text-gray-100 uppercase">Gestion des Réclamations</h1>
        <div className='flex gap-4'>
          {user?.role === "ADMIN" && (<Button className='bg-white text-gray-900 hover:bg-gray-800 hover:text-gray-100' onClick={() => setDisplayedTickets(tickets)}>Tout Tickets</Button>)}
          <Button className='bg-white text-gray-900 hover:bg-gray-800 hover:text-gray-100' onClick={() => setDisplayedTickets(assignedTickets)}>Mes Tickets</Button>
          {user?.role ==="QA" && (<Button onClick={() => setDisplayedTickets(userTickets)}>Tickets Créé</Button>)}
          {
            (user?.role === "QA") && (
              <TicketForm
                onSave={handleCreateTicket}
              />
            )
          }

        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
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
            <option value={TicketStatus.OPEN}>Ouvert</option>
            <option value={TicketStatus.IN_PROGRESS}>En cours</option>
            <option value={TicketStatus.CLOSED}>Clôturé</option>
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
            <option value={TicketPriority.URGENT}>Critique</option>
            <option value={TicketPriority.HIGH}>Haute</option>
            <option value={TicketPriority.MEDIUM}>Moyenne</option>
            <option value={TicketPriority.LOW}>Basse</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm bg-gray-100 rounded-full px-6 py-2 text-gray-900 font-semibold">
            {filteredTickets.length} réclamation{filteredTickets.length > 1 ? 's' : ''} trouvée{filteredTickets.length > 1 ? 's' : ''}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center space-x-2 text-gray-900 hover:text-gray-100 border rounded hover:bg-gray-900 px-6 py-2 transition-all ease-out">
                <Download size={16} />
                <span>Exporter</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Voulez vous axporter vers:</AlertDialogTitle>
                <AlertDialogDescription className='flex justify-center gap-10 items-center py-6'>
                  <Button onClick={() => onClickDownload(filteredTickets)} className="flex items-center space-x-2 bg-red-500 text-white">
                    <Download size={16} />
                    <span>PDF</span>
                  </Button>
                  <Button onClick={() => exportTicketsToExcel(filteredTickets)} className="flex items-center space-x-2 bg-blue-500 text-white">
                    <Download size={16} />
                    <span>EXCEL</span>
                  </Button>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-none shadow-lg">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium  uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {ticket.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ticket.type!)}`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority!)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status!)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.assignedTo!.length > 0
                      ? ticket.assignedTo!.map(a => a.user?.firstName).join(', ')
                      : 'Non assigné'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {((user?.role === "QA") || (user?.role === "ADMIN") || (ticket.createdById === user?.id)) && (
                        <TicketForm
                          ticket={ticket}
                          onSave={handleEditTicket}
                          onclick={() => setEditingTicket(ticket)}
                        />
                      )}
                      <Drawer>
                        <DrawerTrigger asChild>
                          <button onClick={() => setCurrentTicket(ticket)} className="text-gray-600 hover:text-gray-700">
                            <Eye size={16} />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="min-h-[85%] max-h-[85%] overflow-auto bg-white p-6 space-y-6">
                          {currentTicket && (
                            <>
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900">Détails de la réclamation</h2>
                                  <p className="text-sm text-gray-500">Réf: {currentTicket.id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {((user?.role === "QA") || (user?.role === "ADMIN") || (currentTicket.createdById === user?.id)) && (
                                    <TicketForm
                                      ticket={currentTicket}
                                      onSave={handleEditTicket}
                                      onclick={() => setEditingTicket(currentTicket)}
                                    />
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button title="Supprimer" className="px-2 py-1 text-red-600 hover:text-red-700">
                                        <Trash2 size={16} />
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer la réclamation ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Cette action est irréversible. Confirmez la suppression du ticket "{currentTicket.title}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDeleteTicket(currentTicket.id!)}>Supprimer</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>

                              {/* Infos principales */}
                              <div className="space-y-4 border-b border-gray-200 pb-4">
                                <div>
                                  <span className="font-semibold text-gray-700">Titre:</span>
                                  <p className="text-gray-900">{currentTicket.title}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Description:</span>
                                  <p className="mt-1 text-gray-600">
                                    {currentTicket.description || "Aucune description"}
                                  </p>
                                </div>
                              </div>

                              {/* Badges */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <span className="font-semibold text-gray-700">Type:</span>
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${getTypeColor(
                                      currentTicket.type!
                                    )}`}
                                  >
                                    {currentTicket.type}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Priorité:</span>
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${getPriorityColor(
                                      currentTicket.priority!
                                    )}`}
                                  >
                                    {currentTicket.priority}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Statut:</span>
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${getStatusColor(
                                      currentTicket.status!
                                    )}`}
                                  >
                                    {currentTicket.status}
                                  </span>
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-semibold text-gray-700">Créé le:</span>{" "}
                                  {currentTicket.createdAt
                                    ? format(new Date(currentTicket.createdAt), "dd/MM/yyyy HH:mm")
                                    : "-"}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Mis à jour le:</span>{" "}
                                  {currentTicket.updatedAt
                                    ? format(new Date(currentTicket.updatedAt), "dd/MM/yyyy HH:mm")
                                    : "-"}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Date début:</span>{" "}
                                  {currentTicket.startDate
                                    ? format(new Date(currentTicket.startDate), "dd/MM/yyyy")
                                    : "-"}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Date fin:</span>{" "}
                                  {currentTicket.endDate
                                    ? format(new Date(currentTicket.endDate), "dd/MM/yyyy")
                                    : "-"}
                                </div>
                              </div>

                              {/* Assignations */}
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Assigné à</h3>
                                {currentTicket.assignedTo && currentTicket.assignedTo.length > 0 ? (
                                  <ul className="space-y-2">
                                    {currentTicket.assignedTo.map(assign => (
                                      <li
                                        key={assign.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                      >
                                        <span className="text-gray-800">
                                          {assign.user?.firstName} {assign.user?.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {assign.assignedAt
                                            ? format(new Date(assign.assignedAt), "dd/MM/yyyy")
                                            : ""}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">Aucun utilisateur assigné</p>
                                )}
                              </div>
                            </>
                          )}
                        </DrawerContent>

                      </Drawer>
                      <button
                        title="Valider (Clôturer)"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onValidateTicket(ticket.id!)}
                        disabled={ticket.status === TicketStatus.CLOSED}
                      >
                        <Check size={16} />
                      </button>
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

export default TicketList;