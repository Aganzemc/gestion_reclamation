import { TicketStatus, TicketPriority } from '../models/Ticket';
import { UserStatus, UserRole } from '../models/User';

// Type utilitaire pour gérer les propriétés optionnelles avec exactOptionalPropertyTypes
type WithUndefined<T> = {
  [P in keyof T]: T[P] | undefined;
};

export interface ExportQueryParams extends WithUndefined<{
  status: TicketStatus | TicketStatus[];
  priority: TicketPriority | TicketPriority[];
  startDate: string;
  endDate: string;
  assignedTo: string | string[];
  createdBy: string | string[];
  search: string;
  role: UserRole | UserRole[];
  userStatus: UserStatus | UserStatus[];
}> {}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
