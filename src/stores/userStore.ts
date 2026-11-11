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
import { reportError } from '../utils/errorReport';

// 并发去重：应用启动时的全局恢复与页面内的局部调用会同时触发，只发一次请求
let profileInFlight: Promise<void> | null = null;

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
    if (profileInFlight) {
      return profileInFlight;
    }
    profileInFlight = (async () => {
      set({ loading: true });
      try {
        const profile = await getProfile();
        set({ user: profile });
      } catch (err) {
        reportError('获取用户信息失败', err, '获取用户信息失败，请刷新重试');
      } finally {
        set({ loading: false });
        profileInFlight = null;
      }
    })();
    return profileInFlight;
  },

  logout: async () => {
    try {
      const deviceId = getUserDeviceId() || undefined;
      await logoutApi(deviceId ? { deviceId } : {});
    } catch (err) {
      // 本地登录态已清理，服务端会话清理失败只留痕，不打扰用户
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
      // 刷新失败意味着登录态已失效，需要让用户知道「被登出」的原因，而不是静默跳回游客态
      reportError('登录状态刷新失败，请重新登录', err, '登录状态已过期，请重新登录');
      get().logout();
      return null;
    }
  },
}));
