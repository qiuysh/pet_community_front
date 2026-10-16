/** 后台角色与菜单可见性（对齐 Ad0-2-05） */

export type AdminRoleKey = 'super_admin' | 'content_admin' | 'data_admin' | 'service';

export function normalizeAdminRole(role: string | undefined | null): AdminRoleKey {
  if (role === 'admin' || role === 'super_admin') return 'super_admin';
  if (role === 'content_admin' || role === 'data_admin' || role === 'service') {
    return role;
  }
  return 'service';
}

/** 从 JWT payload 读取 role（仅用于菜单展示，鉴权仍以后端为准） */
export function readRoleFromAdminToken(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

/** 侧栏 menu key → 允许角色 */
const menuRoles: Record<string, AdminRoleKey[]> = {
  dashboard: ['super_admin', 'content_admin', 'data_admin', 'service'],
  analytics: ['super_admin', 'data_admin'],
  users: ['super_admin'],
  'front-users': ['super_admin', 'service'],
  settings: ['super_admin', 'content_admin'],
  'sensitive-words': ['super_admin', 'content_admin'],
  logs: ['super_admin', 'data_admin', 'service'],
  activities: ['super_admin', 'content_admin'],
  reviews: ['super_admin', 'content_admin', 'service'],
  reports: ['super_admin', 'content_admin', 'service'],
  notifications: ['super_admin', 'content_admin', 'service'],
  ads: ['super_admin', 'content_admin'],
};

export function canAccessAdminMenu(role: string | undefined | null, menuKey: string): boolean {
  const r = normalizeAdminRole(role);
  const allowed = menuRoles[menuKey];
  if (!allowed) return r === 'super_admin';
  return allowed.includes(r);
}
