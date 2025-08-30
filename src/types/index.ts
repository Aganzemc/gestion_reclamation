export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  dateCreation: Date;
  actif: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  QA = 'QA', 
  STO = 'STO',
  VIEWER = 'VIEWER'
}

export enum TicketStatus {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  CLOTURE = 'CLOTURE'
}

export enum TicketType {
  QUALITE = 'QUALITE',
  INCIDENT = 'INCIDENT', 
  OPERATIONNEL = 'OPERATIONNEL'
}

export enum TicketPriority {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}

export interface Ticket {
  id: string;
  reference: string;
  titre: string;
  description: string;
  type: TicketType;
  priorite: TicketPriority;
  statut: TicketStatus;
  assignes: User[];
  createur: User;
  dateCreation: Date;
  dateCloture?: Date;
  commentaires: Comment[];
}

export interface Comment {
  id: string;
  auteur: User;
  contenu: string;
  date: Date;
}

export interface KPIData {
  totalTickets: number;
  ticketsOuverts: number;
  ticketsEnCours: number;
  ticketsClotures: number;
  tempsTraitement: number;
  tendanceMensuelle: { mois: string; tickets: number }[];
  repartitionType: { type: string; count: number }[];
  ticketsParAgent: { agent: string; count: number }[];
}