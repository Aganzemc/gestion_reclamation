import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Ticket } from '../types/type'; // adapte selon ton chemin

// Styles du PDF
const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf' },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '14.28%', borderStyle: 'solid', borderWidth: 1, backgroundColor: '#2980b9', borderColor: '#bfbfbf', padding: 3 },
  tableCol: { width: '14.28%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', padding: 3 },
  tableCellHeader: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  tableCell: { fontSize: 10 },
});

// Document PDF
const TicketsPDF: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Liste des Tickets</Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRow}>
          {['Titre', 'Type', 'Priorité', 'Statut', 'Assigné à', 'Date'].map((header) => (
            <View style={styles.tableColHeader} key={header}>
              <Text style={styles.tableCellHeader}>{header}</Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {tickets.map((ticket) => (
          <View style={styles.tableRow} key={ticket.id}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{ticket.title}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{ticket.type}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{ticket.priority}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{ticket.status}</Text></View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {ticket.assignedTo && ticket.assignedTo.length > 0
                  ? ticket.assignedTo.map(a => a.user?.firstName).join(', ')
                  : 'Non assigné'}
              </Text>
            </View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default TicketsPDF;
