import { create } from 'zustand';
import { UserInfo } from '../types/user';
import { getProfile, logout as logoutApi } from '../api/user';
import {
  getRefreshToken,
  getUserDeviceId,
  getUserToken,
} from '../utils/authStorage';
import {
  applyUserAuth,
  clearUserSession,
  subscribeSession,
} from '../utils/session';
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
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: getUserToken(),
  refreshToken: getRefreshToken(),
  isLoggedIn: !!getUserToken(),
  loading: false,

  setUser: (user) => set({ user }),
  setToken: (token, refreshToken, remember, deviceId) => {
    if (!token) {
      clearUserSession();
      return;
    }
    applyUserAuth(token, refreshToken, remember, deviceId);
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
      clearUserSession();
    }
  },
}));

// 拦截器静默 refresh / 其它模块写入 session 时，同步 Zustand
subscribeSession((event) => {
  if (event.type === 'user-updated') {
    useUserStore.setState({
      token: event.token,
      refreshToken: event.refreshToken,
      isLoggedIn: true,
    });
    return;
  }
  useUserStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false,
  });
});
