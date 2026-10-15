import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const getPublicKeyMock = vi.fn();
const loginMock = vi.fn();
const encryptMock = vi.fn();
const setPublicKeyMock = vi.fn();
const getStoredPublicKeyMock = vi.fn();

vi.mock('../api/admin', () => ({
  getPublicKey: (...args: unknown[]) => getPublicKeyMock(...args),
  login: (...args: unknown[]) => loginMock(...args),
}));

vi.mock('../utils/crypto', async () => {
  const actual = await vi.importActual<typeof import('../utils/crypto')>('../utils/crypto');
  return {
    ...actual,
    setPublicKey: (key: string) => {
      setPublicKeyMock(key);
      getStoredPublicKeyMock.mockReturnValue(key);
    },
    getPublicKey: () => getStoredPublicKeyMock(),
    encrypt: (data: string) => encryptMock(data),
  };
});

describe('useAdminStore', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getStoredPublicKeyMock.mockReturnValue('');
    localStorage.clear();
    sessionStorage.clear();
  });

  it('初始未登录时 isAuthenticated 应为 false', async () => {
    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    expect(result.current.isAuthenticated()).toBe(false);
    expect(result.current.token).toBeNull();
  });

  it('localStorage 存在 admin_token 时 isAuthenticated 应为 true', async () => {
    localStorage.setItem('admin_token', 'admin-token');
    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    expect(result.current.isAuthenticated()).toBe(true);
    expect(result.current.token).toBe('admin-token');
  });

  it('勾选记住我登录成功时应写入 localStorage', async () => {
    const publicKey = 'test-public-key';
    const admin = { id: 1, username: 'admin' };

    getPublicKeyMock.mockResolvedValue({ publicKey });
    loginMock.mockResolvedValue({ token: 'new-admin-token', admin });
    encryptMock.mockReturnValue('encrypted-password');

    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    let success = false;
    await act(async () => {
      success = await result.current.login(
        { username: 'admin', password: 'Admin@123' },
        { remember: true },
      );
    });

    expect(success).toBe(true);
    expect(result.current.token).toBe('new-admin-token');
    expect(result.current.admin).toEqual(admin);
    expect(result.current.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('admin_token')).toBe('new-admin-token');
    expect(sessionStorage.getItem('admin_token')).toBeNull();
  });

  it('未勾选记住我登录成功时应写入 sessionStorage', async () => {
    const admin = { id: 1, username: 'admin' };
    getPublicKeyMock.mockResolvedValue({ publicKey: 'key' });
    loginMock.mockResolvedValue({ token: 'session-admin-token', admin });
    encryptMock.mockReturnValue('encrypted-password');

    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    let success = false;
    await act(async () => {
      success = await result.current.login(
        { username: 'admin', password: 'Admin@123' },
        { remember: false },
      );
    });

    expect(success).toBe(true);
    expect(sessionStorage.getItem('admin_token')).toBe('session-admin-token');
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  it('login 失败时应设置错误信息并返回 false', async () => {
    getPublicKeyMock.mockResolvedValue({ publicKey: 'key' });
    loginMock.mockRejectedValue(new Error('密码错误'));

    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    let success = true;
    await act(async () => {
      success = await result.current.login({ username: 'admin', password: 'wrong' });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('密码错误');
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('logout 应清除状态和存储', async () => {
    localStorage.setItem('admin_token', 'admin-token');
    const { useAdminStore } = await import('./adminStore');
    const { result } = renderHook(() => useAdminStore());

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(sessionStorage.getItem('admin_token')).toBeNull();
  });
});
