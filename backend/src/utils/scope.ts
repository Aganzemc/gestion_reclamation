import { Request } from 'express';

type GenericWhere = Record<string, unknown>;

function isGlobalViewer(role?: string): boolean {
  if (!role) return false;
  return role === 'ADMIN' || role === 'OBSERVER';
}

export function applyScopedUserFilter(where: GenericWhere, req: Request, targetField: string): GenericWhere {
  const role = (req as any).user?.role as string | undefined;
  const currentUserId = (req as any).user?.id as string | undefined;

  if (!isGlobalViewer(role) && currentUserId) {
    return { ...where, [targetField]: currentUserId };
  }

  return where;
}

export function canViewGlobal(req: Request): boolean {
  const role = (req as any).user?.role as string | undefined;
  return isGlobalViewer(role);
}

// Ticket-specific scoping: STO -> createdById, QA -> assignedTo some userId
export function buildTicketScopeWhere(req: Request, base: GenericWhere = {}): GenericWhere {
  const role = (req as any).user?.role as string | undefined;
  const currentUserId = (req as any).user?.id as string | undefined;

  if (!role || !currentUserId) return base;

  if (isGlobalViewer(role)) return base;

  if (role === 'STO') {
    return { ...base, createdById: currentUserId };
  }

  if (role === 'QA') {
    return {
      ...base,
      assignedTo: {
        some: { userId: currentUserId }
      }
    } as GenericWhere;
  }

  // Default: restrict to own created tickets
  return { ...base, createdById: currentUserId };
}


