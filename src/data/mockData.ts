import { Ticket, TicketStatus, TicketType, TicketPriority, KPIData, User, UserRole } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nom: 'Admin Principal',
    email: 'admin@universite.fr',
    role: UserRole.ADMIN,
    dateCreation: new Date('2024-01-01'),
    actif: true
  },
  {
    id: '2', 
    nom: 'Marie Qualité',
    email: 'qa@universite.fr',
    role: UserRole.QA,
    dateCreation: new Date('2024-01-15'),
    actif: true
  },
  {
    id: '3',
    nom: 'Jean Opérations',
    email: 'sto@universite.fr', 
    role: UserRole.STO,
    dateCreation: new Date('2024-02-01'),
    actif: true
  }
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    reference: 'REC-2024-001',
    titre: 'Problème d\'inscription en ligne',
    description: 'Les étudiants rencontrent des difficultés lors de l\'inscription aux cours en ligne.',
    type: TicketType.INCIDENT,
    priorite: TicketPriority.HAUTE,
    statut: TicketStatus.OUVERT,
    assignes: [mockUsers[2]],
    createur: mockUsers[1],
    dateCreation: new Date('2024-12-01'),
    commentaires: []
  },
  {
    id: '2',
    reference: 'REC-2024-002', 
    titre: 'Demande d\'amélioration des services',
    description: 'Propositions d\'amélioration pour les services étudiants.',
    type: TicketType.QUALITE,
    priorite: TicketPriority.MOYENNE,
    statut: TicketStatus.EN_COURS,
    assignes: [mockUsers[1]],
    createur: mockUsers[0],
    dateCreation: new Date('2024-11-28'),
    commentaires: []
  },
  {
    id: '3',
    reference: 'REC-2024-003',
    titre: 'Dysfonctionnement système paie',
    description: 'Problème technique sur le système de paie des bourses.',
    type: TicketType.OPERATIONNEL,
    priorite: TicketPriority.CRITIQUE,
    statut: TicketStatus.CLOTURE,
    assignes: [mockUsers[2]],
    createur: mockUsers[1],
    dateCreation: new Date('2024-11-25'),
    dateCloture: new Date('2024-11-30'),
    commentaires: []
  }
];

export const mockKPIData: KPIData = {
  totalTickets: 156,
  ticketsOuverts: 23,
  ticketsEnCours: 45,
  ticketsClotures: 88,
  tempsTraitement: 4.2,
  tendanceMensuelle: [
    { mois: 'Jan', tickets: 12 },
    { mois: 'Fév', tickets: 19 },
    { mois: 'Mar', tickets: 15 },
    { mois: 'Avr', tickets: 27 },
    { mois: 'Mai', tickets: 22 },
    { mois: 'Jun', tickets: 18 },
    { mois: 'Jul', tickets: 25 },
    { mois: 'Aoû', tickets: 14 },
    { mois: 'Sep', tickets: 31 },
    { mois: 'Oct', tickets: 28 },
    { mois: 'Nov', tickets: 34 },
    { mois: 'Déc', tickets: 23 }
  ],
  repartitionType: [
    { type: 'Qualité', count: 45 },
    { type: 'Incident', count: 67 },
    { type: 'Opérationnel', count: 44 }
  ],
  ticketsParAgent: [
    { agent: 'Marie Qualité', count: 28 },
    { agent: 'Jean Opérations', count: 31 },
    { agent: 'Admin Principal', count: 15 },
    { agent: 'Sophie Martin', count: 22 }
  ]
};