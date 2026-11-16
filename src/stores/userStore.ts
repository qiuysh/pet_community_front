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

/** 前台用户鉴权深度状态（路由守卫 / 主人视角依赖 ready） */
export type AuthStatus = 'anonymous' | 'bootstrapping' | 'ready';

interface UserState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  /** 是否已完成至少一次资料拉取尝试（成功或失败） */
  profileHydrated: boolean;
  authStatus: AuthStatus;
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

function deriveAuthStatus(token: string | null, profileHydrated: boolean): AuthStatus {
  if (!token) return 'anonymous';
  if (!profileHydrated) return 'bootstrapping';
  return 'ready';
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: getUserToken(),
  refreshToken: getRefreshToken(),
  isLoggedIn: !!getUserToken(),
  profileHydrated: !getUserToken(),
  authStatus: deriveAuthStatus(getUserToken(), !getUserToken()),
  loading: false,

  setUser: (user) =>
    set({
      user,
      profileHydrated: true,
      authStatus: deriveAuthStatus(get().token, true),
    }),
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
        set({
          user: profile,
          profileHydrated: true,
          authStatus: deriveAuthStatus(get().token, true),
        });
      } catch (err) {
        reportError('获取用户信息失败', err, '获取用户信息失败，请刷新重试');
        set({
          profileHydrated: true,
          authStatus: deriveAuthStatus(get().token, true),
        });
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
    const prev = useUserStore.getState();
    // 换票保留已有资料；仅新登录（无 user）时进入 bootstrapping
    const profileHydrated = prev.user !== null ? prev.profileHydrated : false;
    useUserStore.setState({
      token: event.token,
      refreshToken: event.refreshToken,
      isLoggedIn: true,
      profileHydrated,
      authStatus: deriveAuthStatus(event.token, profileHydrated),
    });
    return;
  }
  useUserStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false,
    profileHydrated: true,
    authStatus: 'anonymous',
  });
});
