import { describe, expect, it } from 'vitest';
import { adminRoleLabel, normalizeAdminRole } from './adminRole';

describe('adminRoleLabel', () => {
  it('映射已知角色', () => {
    expect(adminRoleLabel('super_admin')).toBe('超级管理员');
    expect(adminRoleLabel('content_admin')).toBe('内容管理员');
    expect(adminRoleLabel('data_admin')).toBe('数据管理员');
    expect(adminRoleLabel('service')).toBe('客服');
  });

  it('admin 别名归一为超管', () => {
    expect(normalizeAdminRole('admin')).toBe('super_admin');
    expect(adminRoleLabel('admin')).toBe('超级管理员');
  });
});
