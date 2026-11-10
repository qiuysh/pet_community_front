import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import { Key } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldError, FieldLabel, Input } from '../../components/ui/input';
import { Spinner } from '../../components/ui/spinner';

export function ResetPasswordPage() {
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, resetPassword } = useAuth();
  const { countdown, send: sendCodeNow } = useVerificationCode();
  const { errors, showErrors, clearError, formRef } = useFormErrors([
    'account',
    'code',
    'newPassword',
    'confirmPassword',
  ] as const);

  const handleSendCode = () => {
    if (!account.trim()) {
      showErrors({ account: '请输入手机号或邮箱' });
      return;
    }
    sendCodeNow(account, 'reset_password');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors<'account' | 'code' | 'newPassword' | 'confirmPassword'> = {};
    if (!account.trim()) {
      next.account = '请输入手机号或邮箱';
    }
    if (!code.trim()) {
      next.code = '请输入验证码';
    }
    if (!newPassword) {
      next.newPassword = '请输入新密码';
    } else if (newPassword.length < 6) {
      next.newPassword = '密码至少 6 位';
    }
    if (newPassword !== confirmPassword) {
      next.confirmPassword = '两次密码输入不一致';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }

    resetPassword({ account, code, newPassword });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-strong rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="page-content-title">重置密码</h1>
          <p className="text-brown-muted mt-2">输入您的账号信息以重置密码</p>
        </div>

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          <div className="mb-4">
            <FieldLabel htmlFor="reset-account">手机号 / 邮箱</FieldLabel>
            <Input
              id="reset-account"
              name="account"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={account}
              onChange={(e) => {
                setAccount(e.target.value);
                clearError('account');
              }}
              placeholder="请输入注册时的手机号或邮箱…"
              invalid={!!errors.account}
              aria-describedby={errors.account ? 'reset-account-error' : undefined}
            />
            <FieldError id="reset-account-error">{errors.account}</FieldError>
          </div>

          <div className="mb-4">
            <FieldLabel htmlFor="reset-code">验证码</FieldLabel>
            <div className="flex gap-3">
              <Input
                id="reset-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  clearError('code');
                }}
                className="flex-1 min-w-0"
                placeholder="请输入验证码…"
                maxLength={6}
                invalid={!!errors.code}
                aria-describedby={errors.code ? 'reset-code-error' : undefined}
              />
              <Button type="button" variant="outline" disabled={countdown > 0} onClick={handleSendCode}>
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </Button>
            </div>
            <FieldError id="reset-code-error">{errors.code}</FieldError>
          </div>

          <div className="mb-4">
            <FieldLabel htmlFor="reset-new-password">新密码</FieldLabel>
            <Input
              id="reset-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearError('newPassword');
              }}
              placeholder="请设置 6-20 位新密码…"
              invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? 'reset-new-password-error' : undefined}
            />
            <FieldError id="reset-new-password-error">{errors.newPassword}</FieldError>
          </div>

          <div className="mb-6">
            <FieldLabel htmlFor="reset-confirm-password">确认新密码</FieldLabel>
            <Input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError('confirmPassword');
              }}
              placeholder="请再次输入新密码…"
              invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
            />
            <FieldError id="reset-confirm-error">{errors.confirmPassword}</FieldError>
          </div>

          <Button type="submit" block size="lg" disabled={loading} loading={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                重置中…
              </span>
            ) : (
              '确认重置'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary-text hover:text-primary-text font-medium">
            返回登录
          </Link>
        </div>
      </Card>
    </div>
  );
}
