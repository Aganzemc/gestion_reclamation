// types/index.ts

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  USER = 'USER',
  QA = 'QA',
  STO = 'STO',
  OBSERVER = 'OBSERVER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum TicketType {
  INCIDENT = 'INCIDENT',
  QUALITE = 'QUALITE',
  OPERATIONNEL = 'OPERATIONNEL'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

// Interfaces principales
export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  tickets?: Ticket[];
  assignedTickets?: TicketAssignment[];
  notifications?: Notification[];
  sessions?: Session[];
}

export interface Ticket {
  id?: string;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  createdAt?: Date;
  updatedAt?: Date;
  createdById: string;
  createdBy?: User;
  assignedTo?: TicketAssignment[];
}

export interface TicketAssignment {
  id: string;
  ticketId: string;
  userId: string;
  assignedAt: Date;
  ticket?: Ticket;
  user?: User;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: Date;
  user?: User;
}

export interface Session {
  id: string;
  userId: string;
  user?: User;
  token: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
}

// Types pour les formulaires de création
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  createdById: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
}

export interface CreateAssignmentData {
  ticketId: string;
  userId: string;
}

export interface CreateNotificationData {
  type: NotificationType;
  message: string;
  userId: string;
}

export interface UpdateNotificationData {
  type?: NotificationType;
  message?: string;
  isRead?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Types avec relations pour les réponses API
export interface UserWithRelations extends User {
  tickets: Ticket[];
  assignedTickets: TicketAssignment[];
  notifications: Notification[];
  sessions: Session[];
}

export interface TicketWithRelations extends Ticket {
  createdBy: User;
  assignedTo: TicketAssignmentWithUser[];
}

export interface TicketAssignmentWithUser extends TicketAssignment {
  user: User;
}

export interface TicketAssignmentWithTicket extends TicketAssignment {
  ticket: Ticket;
}

export interface NotificationWithUser extends Notification {
  user: User;
}

// Types pour les statistiques
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
}

export interface TicketStats {
  totalTickets: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByType: Record<TicketType, number>;
  ticketsByPriority: Record<TicketPriority, number>;
}

export interface AssignmentStats {
  totalAssignments: number;
  userAssignmentCounts: Array<{
    userId: string;
    user: User;
    count: number;
  }>;
  ticketAssignmentCounts: Array<{
    ticketId: string;
    ticket: Ticket;
    count: number;
  }>;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<NotificationType, number>;
}

// Types pour les filtres
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface TicketFilter {
  status?: TicketStatus;
  type?: TicketType;
  priority?: TicketPriority;
  createdById?: string;
  assignedToUserId?: string;
  search?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
  userId?: string;
}

// Types pour la pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}