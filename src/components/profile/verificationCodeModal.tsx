import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { sendCode } from '../../api/user';
import { SendCodeRequest } from '../../types/user';
import { showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { Button } from '../ui/button';
import { FieldLabel, Input } from '../ui/input';
import { Modal } from '../ui/modal';

/**
 * 绑定/解绑手机号或邮箱时的验证码弹窗
 *
 * 用法:
 *   <VerificationCodeModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     mode="bind"  // bind=绑定/更换,unbind=解绑
 *     channel="phone"  // phone 或 email
 *     currentValue={user?.phone}  // 解绑模式下展示当前值;绑定时作为默认值
 *     onSubmit={async (account, code) => { ... await bindPhone(account, code); }}
 *   />
 *
 * 行为:
 * - bind 模式:用户输入新 account (手机号/邮箱),获取验证码,提交时回调 onSubmit(newAccount, code)
 * - unbind 模式:展示当前 account (只读),获取验证码,提交时回调 onSubmit(currentValue, code)
 * - 倒计时 60s 防止滥用;ESC 关闭
 */
export type VerificationMode = 'bind' | 'unbind';
export type VerificationChannel = 'phone' | 'email';

export interface VerificationCodeModalProps {
  open: boolean;
  onClose: () => void;
  mode: VerificationMode;
  channel: VerificationChannel;
  /** 当前已绑定的值;unbind 模式必填,bind 模式作为输入框 placeholder */
  currentValue?: string;
  /** 提交:返回成功后由调用方关闭弹窗;抛错则保持打开 */
  onSubmit: (account: string, code: string) => Promise<void>;
}

const CODE_TYPE: Record<VerificationChannel, SendCodeRequest['type']> = {
  phone: 'bind_phone',
  email: 'bind_email',
};

const ACCOUNT_LABEL: Record<VerificationChannel, string> = {
  phone: '手机号',
  email: '邮箱',
};

const ACCOUNT_PATTERN: Record<VerificationChannel, RegExp> = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export function VerificationCodeModal({
  open,
  onClose,
  mode,
  channel,
  currentValue,
  onSubmit,
}: VerificationCodeModalProps) {
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    if (open) {
      setAccount(mode === 'unbind' ? currentValue ?? '' : '');
      setCode('');
      setCountdown(0);
    }
  }, [open, mode, currentValue]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const accountValue = mode === 'unbind' ? (currentValue ?? '') : account;
  const isAccountValid = ACCOUNT_PATTERN[channel].test(accountValue);
  const isCodeValid = /^\d{6}$/.test(code);
  const canSubmit = isAccountValid && isCodeValid && !submitting;
  const canSendCode = isAccountValid && countdown === 0 && !sendingCode;

  const handleSendCode = async () => {
    if (!isAccountValid) {
      showErrorToast(`请输入有效的${ACCOUNT_LABEL[channel]}`);
      return;
    }
    setSendingCode(true);
    try {
      await sendCode({ account: accountValue, type: CODE_TYPE[channel] });
      showSuccessToast('验证码已发送,请注意查收');
      setCountdown(60);
    } catch (e) {
      showErrorToast((e as Error)?.message || '验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(accountValue, code);
    } catch (e) {
      showErrorToast((e as Error)?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const title = `${mode === 'bind' ? '绑定' : '解绑'}${ACCOUNT_LABEL[channel]}`;

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      title={title}
      size="sm"
      dismissable={!submitting}
      footer={
        <Button block disabled={!canSubmit} onClick={handleSubmit}>
          {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {mode === 'bind' ? '确认绑定' : '确认解绑'}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="vc-account">{ACCOUNT_LABEL[channel]}</FieldLabel>
          <Input
            id="vc-account"
            value={accountValue}
            onChange={(e) => mode === 'bind' && setAccount(e.target.value)}
            disabled={mode === 'unbind' || submitting}
            placeholder={mode === 'bind' ? `请输入新${ACCOUNT_LABEL[channel]}` : ''}
            aria-label={ACCOUNT_LABEL[channel]}
          />
        </div>

        <div>
          <FieldLabel htmlFor="vc-code">验证码</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="vc-code"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={submitting}
              placeholder="6 位数字"
              className="flex-1"
              aria-label="验证码"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendCode}
              disabled={!canSendCode}
              className="min-w-[88px]"
            >
              {sendingCode ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : countdown > 0 ? (
                `${countdown}s`
              ) : (
                '获取验证码'
              )}
            </Button>
          </div>
        </div>

        {mode === 'unbind' && (
          <p className="text-xs text-error/80 text-center">
            解绑后该{ACCOUNT_LABEL[channel]}将无法用于登录与找回密码
          </p>
        )}
      </div>
    </Modal>
  );
}
