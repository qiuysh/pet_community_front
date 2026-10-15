import { create } from 'zustand';
import { UserInfo } from '../types/user';
import { getProfile, refreshTokenApi, logout as logoutApi } from '../api/user';
import {
  clearUserAuth,
  getRefreshToken,
  getUserDeviceId,
  getUserToken,
  setUserAuth,
} from '../utils/authStorage';

interface UserState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  setUser: (user: UserInfo | null) => void;
  setToken: (
    token: string | null,
    refreshToken?: string | null,
    remember?: boolean,
    deviceId?: string | null,
  ) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  doRefreshToken: () => Promise<string | null>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: getUserToken(),
  refreshToken: getRefreshToken(),
  isLoggedIn: !!getUserToken(),
  loading: false,

  setUser: (user) => set({ user }),
  setToken: (token, refreshToken, remember, deviceId) => {
    if (!token) {
      clearUserAuth();
      set({ token: null, refreshToken: null, isLoggedIn: false });
      return;
    }

    setUserAuth(token, refreshToken, remember, deviceId);
    set({
      token,
      refreshToken: refreshToken ?? get().refreshToken,
      isLoggedIn: true,
    });
  },
  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const profile = await getProfile();
      set({ user: profile });
    } catch (err) {
      console.error('获取用户信息失败', err);
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const deviceId = getUserDeviceId() || undefined;
      await logoutApi(deviceId ? { deviceId } : {});
    } catch (err) {
      console.error('登出接口调用失败', err);
    } finally {
      clearUserAuth();
      set({ user: null, token: null, refreshToken: null, isLoggedIn: false });
    }
  },

  doRefreshToken: async () => {
    const { refreshToken: currentRefreshToken, setToken } = get();
    if (!currentRefreshToken) {
      return null;
    }
    try {
      const response = await refreshTokenApi(currentRefreshToken);
      setToken(response.token, response.refreshToken);
      return response.token;
    } catch (err) {
      console.error('Token刷新失败', err);
      get().logout();
      return null;
    }
  },
}));
