/** True when user may access the Admin tab (GM or Admin role from API). */
export function isAdminOrGmUser(type?: string | null): boolean {
  const normalized = (type ?? '').trim().toUpperCase();
  return normalized === 'GM' || normalized === 'ADMIN';
}
