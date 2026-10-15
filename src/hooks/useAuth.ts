import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginApi, register, resetPassword } from '../api/user';
import { useUserStore } from '../stores/userStore';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';
import { setRememberedUserAccount } from '../utils/authStorage';
import { useAsync } from './useAsync';
import { UserLoginRequest, UserRegisterRequest, PasswordResetRequest } from '../types/user';

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

  return {
    loading,
    login,
    register: registerUser,
    resetPassword: resetUserPassword,
    from,
  };
}
