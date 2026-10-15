import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const getProfileMock = vi.fn();
const logoutMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../api/user', () => ({
  getProfile: (...args: unknown[]) => getProfileMock(...args),
  logout: (...args: unknown[]) => logoutMock(...args),
  refreshTokenApi: vi.fn(),
}));

describe('useUserStore', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('初始状态应为未登录', async () => {
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    expect(result.current.token).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('localStorage 存在 token 时初始应为登录状态', async () => {
    localStorage.setItem('user_token', 'test-token');
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    expect(result.current.token).toBe('test-token');
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('记住我时应持久化到 localStorage，并保存 refreshToken', async () => {
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setToken('new-token', 'refresh-token', true);
    });

    expect(result.current.token).toBe('new-token');
    expect(result.current.refreshToken).toBe('refresh-token');
    expect(result.current.isLoggedIn).toBe(true);
    expect(localStorage.getItem('user_token')).toBe('new-token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
    expect(sessionStorage.getItem('user_token')).toBeNull();
  });

  it('未勾选记住我时应写入 sessionStorage', async () => {
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setToken('session-token', 'refresh-token', false);
    });

    expect(sessionStorage.getItem('user_token')).toBe('session-token');
    expect(sessionStorage.getItem('refresh_token')).toBe('refresh-token');
    expect(localStorage.getItem('user_token')).toBeNull();
  });

  it('setToken(null) 应清除状态与存储', async () => {
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setToken('token', 'refresh', true);
    });
    act(() => {
      result.current.setToken(null);
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(localStorage.getItem('user_token')).toBeNull();
    expect(sessionStorage.getItem('user_token')).toBeNull();
  });

  it('logout 应清除用户状态', async () => {
    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setToken('token');
      result.current.setUser({ id: 1, nickname: 'Tom', avatar: '', phone: '', email: '', gender: 0, signature: '', location: '', petYears: '', status: 1 });
    });
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('fetchProfile 成功时应设置用户信息', async () => {
    const profile = { id: 1, nickname: 'Tom' };
    getProfileMock.mockResolvedValue(profile);

    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchProfile();
    });

    expect(result.current.user).toEqual(profile);
    expect(result.current.loading).toBe(false);
  });

  it('fetchProfile 失败时应停止加载并保持用户为空', async () => {
    getProfileMock.mockRejectedValue(new Error('请求失败'));

    const { useUserStore } = await import('./userStore');
    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchProfile();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
