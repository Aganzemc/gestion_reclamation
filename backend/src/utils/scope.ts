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


