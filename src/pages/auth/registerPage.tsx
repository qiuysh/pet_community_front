import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { UserRegisterRequest } from '../../types/user';
import { UserPlus } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldError, FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';

export function RegisterPage() {
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
  const [registerType, setRegisterType] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { loading, register } = useAuth();
  const { countdown, send: sendCodeNow } = useVerificationCode();
  const { errors, showErrors, clearError, formRef } = useFormErrors([
    'account',
    'code',
    'password',
    'confirmPassword',
    'agreeTerms',
  ] as const);

  const account = registerType === 'phone' ? phone : email;

  const handleSendCode = () => {
    if (!account.trim()) {
      showErrors({ account: registerType === 'phone' ? '请先输入手机号' : '请先输入邮箱' });
      return;
    }
    sendCodeNow(account, 'register');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors<'account' | 'code' | 'password' | 'confirmPassword' | 'agreeTerms'> = {};
    if (!account.trim()) {
      next.account = registerType === 'phone' ? '请输入手机号' : '请输入邮箱';
    }
    if (!code.trim()) {
      next.code = '请输入验证码';
    }
    if (!password) {
      next.password = '请设置密码';
    } else if (password.length < 6) {
      next.password = '密码至少 6 位';
    }
    if (password !== confirmPassword) {
      next.confirmPassword = '两次密码输入不一致';
    }
    if (!agreeTerms) {
      next.agreeTerms = '请阅读并同意用户协议和隐私政策';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }

    const req: UserRegisterRequest = {
      password,
      code,
      nickname: nickname || undefined,
    };
    if (registerType === 'phone') {
      req.phone = phone;
    } else {
      req.email = email;
    }

    register(req);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 py-6">
      <Card className="w-full max-w-md" padding="md">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-primary-strong rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand">
            <UserPlus
              size={ICON_SIZE.nav}
              strokeWidth={iconStroke(ICON_SIZE.nav)}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-bold text-brown">加入{siteName}</h1>
          <p className="text-sm text-brown-muted mt-1">创建账号，开启你的宠物之旅</p>
        </div>

        <div className="mb-4">
          <Tabs
            listOnly
            centered
            selectedKey={registerType}
            onSelectionChange={(key) => setRegisterType(key as 'phone' | 'email')}
            items={[
              { key: 'phone', title: '手机号注册' },
              { key: 'email', title: '邮箱注册' },
            ]}
          />
        </div>

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          {registerType === 'phone' ? (
            <div className="mb-3">
              <FieldLabel htmlFor="register-phone">手机号</FieldLabel>
              <Input
                id="register-phone"
                name="account"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError('account');
                }}
                placeholder="请输入手机号…"
                maxLength={11}
                invalid={!!errors.account}
                aria-describedby={errors.account ? 'register-account-error' : undefined}
              />
              <FieldError id="register-account-error">{errors.account}</FieldError>
            </div>
          ) : (
            <div className="mb-3">
              <FieldLabel htmlFor="register-email">邮箱</FieldLabel>
              <Input
                id="register-email"
                name="account"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('account');
                }}
                placeholder="请输入邮箱地址…"
                invalid={!!errors.account}
                aria-describedby={errors.account ? 'register-account-error' : undefined}
              />
              <FieldError id="register-account-error">{errors.account}</FieldError>
            </div>
          )}

          <div className="mb-3">
            <FieldLabel htmlFor="register-code">验证码</FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Input
                id="register-code"
                name="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  clearError('code');
                }}
                className="min-w-0 flex-1"
                placeholder="请输入验证码…"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                invalid={!!errors.code}
                aria-describedby={errors.code ? 'register-code-error' : undefined}
              />
              <Button
                type="button"
                variant="outline"
                disabled={countdown > 0}
                onClick={handleSendCode}
                className="shrink-0"
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </Button>
            </div>
            <FieldError id="register-code-error">{errors.code}</FieldError>
          </div>

          <div className="mb-3">
            <FieldLabel htmlFor="register-nickname">昵称（选填）</FieldLabel>
            <Input
              id="register-nickname"
              name="nickname"
              autoComplete="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="给自己起个昵称吧…"
              maxLength={20}
            />
          </div>

          <div className="mb-3">
            <FieldLabel htmlFor="register-password">密码</FieldLabel>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              placeholder="请设置 6-20 位密码…"
              invalid={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
            />
            <FieldError id="register-password-error">{errors.password}</FieldError>
          </div>

          <div className="mb-4">
            <FieldLabel htmlFor="register-confirm-password">确认密码</FieldLabel>
            <Input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError('confirmPassword');
              }}
              placeholder="请再次输入密码…"
              invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
            />
            <FieldError id="register-confirm-error">{errors.confirmPassword}</FieldError>
          </div>

          <div className="mb-4">
            <Checkbox
              id="register-agree-terms"
              name="agreeTerms"
              checked={agreeTerms}
              onChange={(checked) => {
                setAgreeTerms(checked);
                clearError('agreeTerms');
              }}
              className="items-start"
            >
              我已阅读并同意《用户协议》与《隐私政策》
            </Checkbox>
            <FieldError id="register-terms-error">{errors.agreeTerms}</FieldError>
          </div>

          <Button type="submit" block size="lg" disabled={loading} loading={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                注册中…
              </span>
            ) : (
              '注册'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-brown-muted">
            已有账号？{' '}
            <Link to="/login" className="text-primary-text hover:text-primary-text font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
