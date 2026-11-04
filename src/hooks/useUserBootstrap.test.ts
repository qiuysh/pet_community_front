import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const getProfileMock = vi.fn();

vi.mock('../api/user', () => ({
  getProfile: (...args: unknown[]) => getProfileMock(...args),
  logout: vi.fn(),
  refreshTokenApi: vi.fn(),
}));

import { useUserBootstrap } from './useUserBootstrap';
import { useUserStore } from '../stores/userStore';
import { UserInfo } from '../types/user';

const PROFILE: UserInfo = {
  id: 1,
  nickname: 'Tom',
  avatar: '',
  phone: '',
  email: '',
  gender: 0,
  signature: '',
  location: '',
  petYears: '',
  status: 1,
};

describe('useUserBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    useUserStore.setState({ user: null, token: null, isLoggedIn: false, loading: false });
  });

  it('已登录且无用户信息时应补拉资料', async () => {
    getProfileMock.mockResolvedValue(PROFILE);
    useUserStore.setState({ token: 'token', isLoggedIn: true, user: null });

    renderHook(() => useUserBootstrap());

    await waitFor(() => expect(useUserStore.getState().user).toEqual(PROFILE));
    expect(getProfileMock).toHaveBeenCalledTimes(1);
  });

  it('未登录时不应请求资料', async () => {
    useUserStore.setState({ token: null, isLoggedIn: false, user: null });

    renderHook(() => useUserBootstrap());

    await waitFor(() => expect(useUserStore.getState().loading).toBe(false));
    expect(getProfileMock).not.toHaveBeenCalled();
  });

  it('已有用户信息时不重复请求', async () => {
    useUserStore.setState({ token: 'token', isLoggedIn: true, user: PROFILE });

    renderHook(() => useUserBootstrap());

    await waitFor(() => expect(useUserStore.getState().loading).toBe(false));
    expect(getProfileMock).not.toHaveBeenCalled();
  });
});
