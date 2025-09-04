import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Ticket } from '../types/type'; // ou le chemin où est défini ton type Ticket

export const exportTicketsToExcel = (tickets: Ticket[]) => {
  // Préparer les données pour Excel
  const data = tickets.map(ticket => ({
    Titre: ticket.title,
    Type: ticket.type,
    Priorité: ticket.priority,
    Statut: ticket.status,
    'Assigné à': ticket.assignedTo && ticket.assignedTo.length > 0
      ? ticket.assignedTo.map(a => a.user?.firstName).join(', ')
      : 'Non assigné',
    Date: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '',
  }));

  // Créer la feuille et le classeur
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

  // Générer le fichier Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'tickets.xlsx');
};
