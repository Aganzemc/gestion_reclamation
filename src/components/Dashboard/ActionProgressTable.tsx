import React from 'react';
import { format, differenceInCalendarDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTickets } from '../../hooks/useTickets';
import { Ticket, TicketStatus } from '../../types/type';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DownLoadPdf } from '../../lib/downloadPdf';

// Lightweight PDF using @react-pdf for this table + KPIs
import ReactPDF, { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const pdfStyles = StyleSheet.create({
  page: { padding: 18, fontSize: 10 },
  title: { fontSize: 14, marginBottom: 10 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  kpi: { padding: 6, borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd' },
  th: { backgroundColor: '#111827', color: '#fff', padding: 4, fontSize: 9 },
  td: { padding: 4, borderBottomWidth: 1, borderStyle: 'solid', borderColor: '#eee', fontSize: 9 },
  tr: { flexDirection: 'row' },
  col: { width: '8%' },
  colDesc: { width: '20%' },
});

function getAssignedNames(ticket: Ticket): string {
  if (!ticket.assignedTo || ticket.assignedTo.length === 0) return '-';
  const names = ticket.assignedTo
    .map(a => a.user ? `${a.user.firstName ?? ''} ${a.user.lastName ?? ''}`.trim() : '')
    .filter(Boolean);
  return names.length ? names.join(', ') : '-';
}

function getPercent(status?: TicketStatus): number {
  switch (status) {
    case 'OPEN':
      return 0;
    case 'IN_PROGRESS':
      return 50;
    case 'RESOLVED':
    case 'CLOSED':
      return 100;
    case 'REJECTED':
      return 0;
    default:
      return 0;
  }
}

function getEtatRealisation(status?: TicketStatus): string {
  switch (status) {
    case 'CLOSED':
    case 'RESOLVED':
      return 'Fait';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'OPEN':
      return 'Ouvert';
    case 'REJECTED':
      return 'Rejeté';
    default:
      return '-';
  }
}

function getRapport(status?: TicketStatus): string {
  switch (status) {
    case 'OPEN':
      return "En attente d'action";
    case 'IN_PROGRESS':
      return 'Traitement en cours';
    case 'RESOLVED':
      return 'Résolu – en attente de clôture';
    case 'CLOSED':
      return 'Clôturé';
    case 'REJECTED':
      return 'Rejeté';
    default:
      return '-';
  }
}

function StatusBadge({ status }: { status?: TicketStatus }) {
  const map: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    CLOSED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-rose-100 text-rose-800',
  };
  const label = getEtatRealisation(status);
  const cls = status ? map[status] : 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${cls}`}>{label}</span>;
}

function getRespectDelaiLabel(t: Ticket): { label: string; cls: string } {
  if (!t.endDate) return { label: '-', cls: 'bg-gray-100 text-gray-700' };
  const due = new Date(t.endDate);
  const now = new Date();
  const ref = (t.status === 'CLOSED' || t.status === 'RESOLVED')
    ? (t.updatedAt ? new Date(t.updatedAt) : now)
    : now;

  if (ref > due) return { label: 'Fait en retard', cls: 'bg-rose-100 text-rose-800' };
  if (ref.toDateString() === due.toDateString()) return { label: 'Fait en temps', cls: 'bg-slate-100 text-slate-800' };
  return { label: 'Fait en avance', cls: 'bg-teal-100 text-teal-800' };
}

function buildExcel(rows: any[], kpis: { label: string; value: string | number }[]) {
  // Two worksheets: KPIs and Suivi
  const kpiSheet = XLSX.utils.json_to_sheet(
    kpis.map(k => ({ Indicateur: k.label, Valeur: k.value }))
  );
  const tableSheet = XLSX.utils.json_to_sheet(rows);

  // Style header row and set column widths on the Suivi sheet
  if (rows && rows.length > 0) {
    const headerKeys = Object.keys(rows[0]);
    // Header styles (may require a compatible Excel viewer)
    for (let c = 0; c < headerKeys.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
      const cell = tableSheet[cellAddress];
      if (cell) {
        (cell as any).s = {
          fill: { patternType: 'solid', fgColor: { rgb: '111827' } },
          font: { color: { rgb: 'FFFFFF' }, bold: true },
          alignment: { vertical: 'center' }
        };
      }
    }

    // Column widths: widen Description column
    const descriptionIndex = headerKeys.findIndex(k => k.toLowerCase().startsWith('description'));
    tableSheet['!cols'] = headerKeys.map((key, idx) => {
      if (idx === descriptionIndex) return { wch: 60 };
      if (key.toLowerCase().includes('titre')) return { wch: 28 };
      if (key.toLowerCase().includes('rôle') || key.toLowerCase().includes('role')) return { wch: 26 };
      if (key.toLowerCase().includes('date')) return { wch: 14 };
      if (key.toLowerCase().includes('réalisation') || key.includes('%')) return { wch: 14 };
      if (key.toLowerCase().includes('respect')) return { wch: 20 };
      if (key.toLowerCase().includes('écart') || key.toLowerCase().includes('ecart')) return { wch: 12 };
      if (key === 'N°' || key.toLowerCase() === 'n°') return { wch: 5 };
      return { wch: 12 };
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');
  XLSX.utils.book_append_sheet(wb, tableSheet, 'Suivi');

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, 'dashboard_suivi.xlsx');
}

function PdfDoc({ rows, kpis }: { rows: any[]; kpis: { label: string; value: string | number }[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Dashboard - KPIs et Suivi</Text>
        <View style={pdfStyles.kpiRow}>
          {kpis.map((k, i) => (
            <View key={i} style={pdfStyles.kpi}>
              <Text>{k.label}: {k.value}</Text>
            </View>
          ))}
        </View>
        <View>
          <View style={[pdfStyles.tr]}>
            {[
              { label: 'N°', style: pdfStyles.col },
              { label: 'Titre', style: pdfStyles.col },
              { label: 'Description', style: pdfStyles.colDesc },
              { label: 'Rôle', style: pdfStyles.col },
              { label: 'Type', style: pdfStyles.col },
              { label: 'Priorité', style: pdfStyles.col },
              { label: 'Échéance', style: pdfStyles.col },
              { label: '%', style: pdfStyles.col },
              { label: 'État', style: pdfStyles.col },
              { label: 'Respect délai', style: pdfStyles.col },
              { label: 'Écart (j)', style: pdfStyles.col },
            ].map((h, i) => (
              <View key={i} style={[h.style]}>
                <Text style={pdfStyles.th}>{h.label}</Text>
              </View>
            ))}
          </View>
          {rows.map((r: any) => (
            <View key={r.index} style={pdfStyles.tr}>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.index}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.title}</Text>
              <Text style={[pdfStyles.td, pdfStyles.colDesc]}>{r.description}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.role}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.type}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.priority}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{`${r.startDate} - ${r.endDate}`}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{`${r.percent}%`}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.etatLabel}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.respect.label}</Text>
              <Text style={[pdfStyles.td, pdfStyles.col]}>{r.ecart}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

const ActionProgressTable: React.FC = () => {
  const { tickets } = useTickets();

  const rows = tickets.map((t, idx) => {
    const start = (t.startDate ? new Date(t.startDate) : (t.createdAt ? new Date(t.createdAt) : undefined));
    const end = (t.endDate ? new Date(t.endDate) : (t.updatedAt ? new Date(t.updatedAt) : undefined));
    const now = new Date();
    const due = t.endDate ? new Date(t.endDate) : undefined;

    // Late/On-time evaluation
    let isLate = false;
    if (due) {
      if (t.status === 'CLOSED' || t.status === 'RESOLVED') {
        const doneAt = t.updatedAt ? new Date(t.updatedAt) : now;
        isLate = isAfter(doneAt, due);
      } else {
        isLate = isAfter(now, due);
      }
    }

    const respect = getRespectDelaiLabel(t);
    const ecartDays = start && end ? differenceInCalendarDays(end, start) : undefined;

    return {
      index: idx + 1,
      title: t.title,
      description: t.description ?? '-',
      role: getAssignedNames(t),
      startDate: start ? format(start, 'dd/MM/yyyy', { locale: fr }) : '-',
      endDate: end ? format(end, 'dd/MM/yyyy', { locale: fr }) : '-',
      percent: getPercent(t.status),
      status: t.status,
      etatLabel: getEtatRealisation(t.status),
      type: t.type ?? '-',
      priority: t.priority ?? '-',
      respect,
      ecart: typeof ecartDays === 'number' ? `${ecartDays} j` : '-',
      isLate,
    };
  });

  // KPIs to export (6 cartes actuelles du dashboard + 2 nouvelles). On exporte seulement 6: Total, En Cours, Clôturées, Non Assignés, % Fait en temps, % En retard.
  // Les 2 dernières ne sont pas disponibles ici; on exportera celles du tableau si besoin. Pour l’instant, on inclut des basiques dérivées localement.
  const total = tickets.length;
  const enCours = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const clotures = tickets.filter(t => t.status === 'CLOSED').length;
  const nonAssignes = tickets.filter(t => !t.assignedTo || t.assignedTo.length === 0).length;
  const withDue = tickets.filter(t => t.endDate).length || 1;
  const onTime = tickets.filter(t => t.endDate && (!t.updatedAt || new Date(t.updatedAt) <= new Date(t.endDate!))).length;
  const late = tickets.filter(t => t.endDate && t.updatedAt && new Date(t.updatedAt) > new Date(t.endDate!)).length;
  const kpis = [
    { label: 'Total Réclamations', value: total },
    { label: 'En Cours', value: enCours },
    { label: 'Clôturées', value: clotures },
    { label: 'Non Assignés', value: nonAssignes },
    { label: '% Fait en temps', value: `${Math.round((onTime / withDue) * 100)}%` },
    { label: '% En retard', value: `${Math.round((late / withDue) * 100)}%` },
  ];

  const exportExcel = () => {
    const enriched = rows.map(r => ({
      'N°': r.index,
      'Titre': r.title,
      'Description': r.description,
      'Rôle (STO)': r.role,
      'Type': r.type,
      'Priorité': r.priority,
      'Date début': r.startDate,
      'Date fin': r.endDate,
      '% Réalisation': r.percent,
      'État Réalisation': r.etatLabel,
      'Respect de délai': r.respect.label,
      'Écart (jours)': r.ecart,
    }));
    buildExcel(enriched as any, kpis);
  };

  const exportPdf = () => DownLoadPdf({ pdfElement: <PdfDoc rows={rows} kpis={kpis} />, filename: 'dashboard_suivi.pdf' });

  return (
    <div className="p-6 overflow-x-auto bg-white shadow-lg rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Suivi d'exécution des actions
        </h3>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-3 py-2 text-sm font-semibold text-gray-900 bg-transparent border border-gray-900 px-6 hover:bg-gray-900 hover:text-white transition-all duration-500 ease-in-out">Exporter</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exporter le Dashboard</AlertDialogTitle>
                <AlertDialogDescription>Choisissez le format d'exportation.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex items-center justify-center gap-4 py-4">
                <button onClick={exportPdf} className="px-4 py-2 text-white bg-rose-600 rounded hover:bg-rose-700">PDF</button>
                <button onClick={exportExcel} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Excel</button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Fermer</AlertDialogCancel>
                <AlertDialogAction onClick={exportPdf}>Exporter</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-none shadow-lg">
            <thead className="bg-gray-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left">N°</th>
            <th className="px-4 py-3 text-left">Titre Ticket</th>
            <th className="px-4 py-3 text-left">Actions (Description Ticket)</th>
            <th className="px-4 py-3 text-left">Rôle (STO)</th>
            <th className="px-4 py-3 text-left">Échéance (Début / Fin)</th>
            <th className="px-4 py-3 text-left">% Réalisation</th>
            <th className="px-4 py-3 text-left">État Réalisation</th>
            <th className="px-4 py-3 text-left">Respect de délai</th>
            <th className="px-4 py-3 text-left">Écart (jours)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3" colSpan={9}>Aucune donnée</td>
            </tr>
          ) : (
            rows.map(r => (
              <tr key={r.index} className={`hover:bg-gray-50 ${r.isLate ? 'bg-rose-50' : ''}`}>
                <td className="px-4 py-3">{r.index}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-700 max-w-xl">
                  <div className="line-clamp-2">{r.description}</div>
                </td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.startDate} — {r.endDate}</td>
                <td className="px-4 py-3 w-44">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full ${r.isLate ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${r.isLate ? 'text-rose-700' : 'text-emerald-700'}`}>{r.percent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${r.respect.cls}`}>{r.respect.label}</span>
                </td>
                <td className="px-4 py-3">{r.ecart}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      </div>
      <p className="mt-3 text-xs text-red-500 font-semibold">
        Remarque: en l'absence de dates d'échéance, les dates affichées sont la date de création et la dernière mise à jour du ticket.
      </p>
    </div>
  );
};

export default ActionProgressTable; 