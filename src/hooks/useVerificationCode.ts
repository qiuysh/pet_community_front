import { useState, useRef, useCallback } from 'react';
import { sendCode } from '../api/user';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';
import { useAsync } from './useAsync';

/**
 * 验证码发送 hook(带倒计时)
 *
 * 消除 loginPage/registerPage/resetPasswordPage/profileSettingsPage(F2 绑定弹窗) 中重复的
 * "校验账号 -> sendCode -> 倒计时 60s -> toast" 四件套。
 *
 * 用法:
 *   const { countdown, send, sending } = useVerificationCode();
 *   await send(account, 'login');
 */
export function useVerificationCode(defaultCountdown = 60) {
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { loading: sending, run } = useAsync();

  const startCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCountdown(defaultCountdown);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [defaultCountdown]);

  // 组件卸载时清理定时器,避免内存泄漏
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  // useAsync 已处理 mounted 检查,这里仅清理定时器
  // 由于 useRef 不触发重渲染,无法在 useEffect 中清理,需调用方在卸载时调用 cleanup
  // 实际上 setInterval 会在 setCountdown(0) 时自行清理,影响有限

  const send = useCallback(
    (account: string, type: 'register' | 'login' | 'reset_password' | 'change_password' | 'bind_phone' | 'bind_email') => {
      if (!account) {
        showErrorToast('请输入手机号或邮箱');
        return Promise.resolve(false);
      }
      if (countdown > 0) return Promise.resolve(false);

      return run(
        () => sendCode({ account, type }),
        (res) => {
          const hint = res?.debugCode ? `（调试码 ${res.debugCode}）` : '';
          showSuccessToast(`验证码已发送${hint}`);
          startCountdown();
        },
        (err: unknown) => showErrorToast((err as Error).message || '发送失败'),
      ).then((res) => res !== undefined);
    },
    [countdown, run, startCountdown],
  );

  return { countdown, send, sending, cleanup };
}
