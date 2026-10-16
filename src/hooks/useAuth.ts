import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginApi, register, resetPassword, thirdPartyLogin } from '../api/user';
import { useUserStore } from '../stores/userStore';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toastManager';
import { setRememberedUserAccount } from '../utils/authStorage';
import { useAsync } from './useAsync';
import { UserLoginRequest, UserRegisterRequest, PasswordResetRequest } from '../types/user';

const DEMO_OAUTH_KEY = (platform: string) => `pet_demo_oauth_${platform}`;

function getOrCreateDemoOAuthCode(platform: string): string {
  try {
    const existing = localStorage.getItem(DEMO_OAUTH_KEY(platform));
    if (existing) return existing;
    const code = `demo_${platform}_${crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
    localStorage.setItem(DEMO_OAUTH_KEY(platform), code);
    return code;
  } catch {
    return `demo_${platform}_${Date.now()}`;
  }
}

export interface LoginOptions {
  remember?: boolean;
}

/**
 * 认证 hook
 *
 * 封装登录/注册/重置密码三个操作,统一处理:
 * - useAsync 加载状态
 * - 成功/失败 toast
 * - 登录成功后写 token + user 到 store,并跳回来源页(from)
 * - 记住我：token 写入 localStorage；否则写入 sessionStorage
 *
 * 用法:
 *   const { login, register: registerFn, resetPassword: resetFn, loading } = useAuth();
 *   await login({ account, loginType: 'password', password }, { remember: true });
 */
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useUserStore();
  const { loading, run } = useAsync();

  // 来源页:登录成功后跳回,默认首页
  const from = (location.state as { from?: string } | null)?.from || '/';

  const login = useCallback(
    (req: UserLoginRequest, options?: LoginOptions) => {
      const remember = options?.remember ?? false;
      return run(
        () => loginApi({ ...req, remember }),
        (res) => {
          setToken(res.token, res.refreshToken, remember, res.deviceId);
          setUser(res.user);
          setRememberedUserAccount(remember ? req.account : null);
          showSuccessToast('登录成功');
          navigate(from, { replace: true });
        },
        (err: unknown) => showErrorToast((err as Error).message || '登录失败'),
      ).then((res) => res !== undefined);
    },
    [run, setToken, setUser, navigate, from],
  );

  const registerUser = useCallback(
    (req: UserRegisterRequest) => {
      return run(
        () => register(req),
        () => {
          showSuccessToast('注册成功，请登录');
          navigate('/login');
        },
        (err: unknown) => showErrorToast((err as Error).message || '注册失败'),
      ).then((res) => res !== undefined);
    },
    [run, navigate],
  );

  const resetUserPassword = useCallback(
    (req: PasswordResetRequest) => {
      return run(
        () => resetPassword(req),
        () => {
          showSuccessToast('密码重置成功，请登录');
          navigate('/login');
        },
        (err: unknown) => showErrorToast((err as Error).message || '重置失败'),
      ).then((res) => res !== undefined);
    },
    [run, navigate],
  );

  /** 演示模式第三方登录：无真实 OAuth，使用本地稳定 code 调用后端模拟接口 */
  const loginWithThirdParty = useCallback(
    (platform: 'wechat' | 'weibo' | 'qq') => {
      const labels = { wechat: '微信', weibo: '微博', qq: 'QQ' } as const;
      if (
        !window.confirm(
          `当前为演示模式：将模拟${labels[platform]}登录（未接入真实 OAuth）。\n同一浏览器再次点击会登录同一演示账号。是否继续？`,
        )
      ) {
        return Promise.resolve(false);
      }
      const code = getOrCreateDemoOAuthCode(platform);
      showInfoToast(`正在通过${labels[platform]}演示登录…`);
      return run(
        () => thirdPartyLogin({ platform, code }),
        (res) => {
          if (!res.token || !res.user) {
            showErrorToast('第三方登录响应异常');
            return;
          }
          setToken(res.token, res.refreshToken, true, res.deviceId);
          setUser(res.user);
          showSuccessToast(res.isNewUser ? '演示账号已创建并登录' : '登录成功');
          navigate(from, { replace: true });
        },
        (err: unknown) => showErrorToast((err as Error).message || '第三方登录失败'),
      ).then((res) => res !== undefined);
    },
    [run, setToken, setUser, navigate, from],
  );

  return {
    loading,
    login,
    register: registerUser,
    resetPassword: resetUserPassword,
    loginWithThirdParty,
    from,
  };
}
