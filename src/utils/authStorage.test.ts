import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAdminAuth,
  clearUserAuth,
  getAdminToken,
  getRefreshToken,
  getRememberedAdminUsername,
  getRememberedUserAccount,
  getUserToken,
  isAdminApiUrl,
  isAdminRemembered,
  isUserRemembered,
  setAdminAuth,
  setRememberedAdminUsername,
  setRememberedUserAccount,
  setUserAuth,
} from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('记住我时应把用户 token 写入 localStorage', () => {
    setUserAuth('access', 'refresh', true);

    expect(localStorage.getItem('user_token')).toBe('access');
    expect(localStorage.getItem('refresh_token')).toBe('refresh');
    expect(sessionStorage.getItem('user_token')).toBeNull();
    expect(isUserRemembered()).toBe(true);
    expect(getUserToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
  });

  it('未记住我时应把用户 token 写入 sessionStorage', () => {
    setUserAuth('access', 'refresh', false);

    expect(sessionStorage.getItem('user_token')).toBe('access');
    expect(localStorage.getItem('user_token')).toBeNull();
    expect(isUserRemembered()).toBe(false);
  });

  it('刷新 token 时应沿用记住我偏好', () => {
    setUserAuth('old', 'old-refresh', true);
    setUserAuth('new', 'new-refresh');

    expect(localStorage.getItem('user_token')).toBe('new');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
    expect(isUserRemembered()).toBe(true);
  });

  it('清除用户登录态时应只清 token，保留记住我偏好', () => {
    setUserAuth('access', 'refresh', true);
    setRememberedUserAccount('user@example.com');
    clearUserAuth();

    expect(getUserToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(isUserRemembered()).toBe(true);
    expect(getRememberedUserAccount()).toBe('user@example.com');
  });

  it('管理员记住我应写入 localStorage，否则写入 sessionStorage', () => {
    setAdminAuth('admin-token', true);
    expect(getAdminToken()).toBe('admin-token');
    expect(localStorage.getItem('admin_token')).toBe('admin-token');
    expect(isAdminRemembered()).toBe(true);

    clearAdminAuth();
    setAdminAuth('session-admin', false);
    expect(sessionStorage.getItem('admin_token')).toBe('session-admin');
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(isAdminRemembered()).toBe(false);
  });

  it('应能保存并读取记住的账号', () => {
    setRememberedUserAccount('user@example.com');
    setRememberedAdminUsername('admin');

    expect(getRememberedUserAccount()).toBe('user@example.com');
    expect(getRememberedAdminUsername()).toBe('admin');

    setRememberedUserAccount(null);
    setRememberedAdminUsername(null);
    expect(getRememberedUserAccount()).toBe('');
    expect(getRememberedAdminUsername()).toBe('');
  });

  it('用户端与管理端记住我互不影响', () => {
    setUserAuth('user-token', 'user-refresh', true);
    setRememberedUserAccount('user@example.com');
    setAdminAuth('admin-token', false);
    setRememberedAdminUsername('admin');

    // 清用户端不影响管理端
    clearUserAuth();
    expect(getUserToken()).toBeNull();
    expect(isUserRemembered()).toBe(true);
    expect(getRememberedUserAccount()).toBe('user@example.com');
    expect(getAdminToken()).toBe('admin-token');
    expect(isAdminRemembered()).toBe(false);
    expect(getRememberedAdminUsername()).toBe('admin');

    // 恢复用户端后清管理端不影响用户端
    setUserAuth('user-token-2', 'user-refresh-2', true);
    clearAdminAuth();
    expect(getAdminToken()).toBeNull();
    expect(isAdminRemembered()).toBe(false);
    expect(getRememberedAdminUsername()).toBe('admin');
    expect(getUserToken()).toBe('user-token-2');
    expect(isUserRemembered()).toBe(true);
    expect(getRememberedUserAccount()).toBe('user@example.com');
  });

  it('一侧改记住我偏好不影响另一侧', () => {
    setUserAuth('user-token', 'user-refresh', true);
    setAdminAuth('admin-token', true);

    setUserAuth('user-token-2', 'user-refresh-2', false);
    expect(isUserRemembered()).toBe(false);
    expect(sessionStorage.getItem('user_token')).toBe('user-token-2');
    expect(isAdminRemembered()).toBe(true);
    expect(localStorage.getItem('admin_token')).toBe('admin-token');

    setAdminAuth('admin-token-2', false);
    expect(isAdminRemembered()).toBe(false);
    expect(sessionStorage.getItem('admin_token')).toBe('admin-token-2');
    expect(isUserRemembered()).toBe(false);
    expect(sessionStorage.getItem('user_token')).toBe('user-token-2');
  });

  it('isAdminApiUrl 应正确识别管理端接口', () => {
    expect(isAdminApiUrl('/api/v1/admin/users')).toBe(true);
    expect(isAdminApiUrl('/api/v1/admin-login')).toBe(true);
    expect(isAdminApiUrl('/api/v1/auth/login')).toBe(false);
    expect(isAdminApiUrl('/api/v1/posts')).toBe(false);
  });
});
