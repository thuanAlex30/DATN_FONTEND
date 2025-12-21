export function getTenantIdFromUser(user: any): string | null {
  if (!user) return null;
  // Common shapes: user.tenant_id, user.tenant?._id, user.data?.tenant_id
  if (user.tenant_id) return user.tenant_id;
  if (user.tenant && (user.tenant._id || user.tenant.id)) return user.tenant._id || user.tenant.id;
  if (user.data && user.data.tenant_id) return user.data.tenant_id;
  return null;
}

export function getDepartmentIdFromUser(user: any): string {
  if (!user) return '';
  // Common shapes: user.department_id (object or id), user.department (object), user.data.department_id
  const dep = user.department_id || user.department || (user.data && user.data.department_id);
  if (!dep) return '';
  if (typeof dep === 'string') return dep;
  if (dep._id) return dep._id;
  if (dep.id) return dep.id;
  // Fallback to empty string
  return '';
}

export function ensureUserTenant(user: any) {
  return getTenantIdFromUser(user) || null;
}


