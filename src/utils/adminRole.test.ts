import { describe, expect, it } from 'vitest';
import { canAccessAdminMenu, normalizeAdminRole, readRoleFromAdminToken } from './adminRole';

describe('adminRole', () => {
  it('normalizeAdminRole maps legacy admin to super_admin', () => {
    expect(normalizeAdminRole('admin')).toBe('super_admin');
    expect(normalizeAdminRole('content_admin')).toBe('content_admin');
  });

  it('canAccessAdminMenu respects matrix', () => {
    expect(canAccessAdminMenu('data_admin', 'analytics')).toBe(true);
    expect(canAccessAdminMenu('data_admin', 'users')).toBe(false);
    expect(canAccessAdminMenu('service', 'front-users')).toBe(true);
    expect(canAccessAdminMenu('service', 'ads')).toBe(false);
    expect(canAccessAdminMenu('content_admin', 'reviews')).toBe(true);
  });

  it('readRoleFromAdminToken parses payload', () => {
    const payload = btoa(JSON.stringify({ role: 'data_admin' }));
    const token = `hdr.${payload}.sig`;
    expect(readRoleFromAdminToken(token)).toBe('data_admin');
  });
});
