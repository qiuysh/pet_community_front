import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import {
  getRememberedUserAccount,
  isUserRemembered,
} from '../../utils/authStorage';
import { UserLoginRequest } from '../../types/user';
import { PawPrint } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldError, FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { BrandSocialIcon } from '../../components/icons/brandSocialIcons';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

export function LoginPage() {
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [account, setAccount] = useState(() => getRememberedUserAccount());
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(() => isUserRemembered() || !!getRememberedUserAccount());
  const { loading, login, loginWithThirdParty } = useAuth();
  const { countdown, send: sendCodeNow } = useVerificationCode();
  const { errors, showErrors, clearError, formRef } = useFormErrors(['account', 'password', 'code'] as const);

  const handleSendCode = () => {
    sendCodeNow(account, 'login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors<'account' | 'password' | 'code'> = {};
    if (!account.trim()) {
      next.account = '请输入手机号或邮箱';
    }
    if (loginType === 'password' && !password) {
      next.password = '请输入密码';
    }
    if (loginType === 'code' && !code.trim()) {
      next.code = '请输入验证码';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }

    const req: UserLoginRequest = {
      account,
      loginType,
    };
    if (loginType === 'password') {
      req.password = password;
    } else {
      req.code = code;
    }

    login(req, { remember });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-72 w-72 -translate-y-1/3 translate-x-1/3 rounded-full bg-secondary-soft/90 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-56 w-56 translate-y-1/3 -translate-x-1/4 rounded-full bg-primary/15 blur-2xl" />

      <Card className="w-full max-w-md relative animate-fadeIn" padding="md">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-primary-strong rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand">
            <PawPrint
              size={ICON_SIZE.nav}
              strokeWidth={iconStroke(ICON_SIZE.nav)}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-semibold text-brown">欢迎来到{siteName}</h1>
          <p className="text-sm text-brown-secondary mt-1">登录您的账号，与宠友分享快乐</p>
        </div>

        <div className="mb-4">
          <Tabs
            listOnly
            centered
            selectedKey={loginType}
            onSelectionChange={(key) => setLoginType(key as 'password' | 'code')}
            items={[
              { key: 'password', title: '密码登录' },
              { key: 'code', title: '验证码登录' },
            ]}
          />
        </div>

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          <div className="mb-3">
            <FieldLabel htmlFor="login-account">手机号 / 邮箱</FieldLabel>
            <Input
              id="login-account"
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
              placeholder="请输入手机号或邮箱…"
              invalid={!!errors.account}
              aria-describedby={errors.account ? 'login-account-error' : undefined}
            />
            <FieldError id="login-account-error">{errors.account}</FieldError>
          </div>

          {loginType === 'password' ? (
            <div className="mb-4">
              <FieldLabel htmlFor="login-password">密码</FieldLabel>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                placeholder="请输入密码…"
                invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              <FieldError id="login-password-error">{errors.password}</FieldError>
            </div>
          ) : (
            <div className="mb-4">
              <FieldLabel htmlFor="login-code">验证码</FieldLabel>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Input
                  id="login-code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    clearError('code');
                  }}
                  className="min-w-0 flex-1"
                  placeholder="请输入验证码…"
                  maxLength={6}
                  invalid={!!errors.code}
                  aria-describedby={errors.code ? 'login-code-error' : undefined}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className="shrink-0 sm:self-stretch"
                  aria-label={countdown > 0 ? `${countdown}秒后可重新获取验证码` : '获取验证码'}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </Button>
              </div>
              <FieldError id="login-code-error">{errors.code}</FieldError>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <Checkbox
              id="user-remember-me"
              name="user_remember_me"
              checked={remember}
              onChange={setRemember}
            >
              记住我
            </Checkbox>
            <Link to="/reset-password" className="text-sm text-primary-text hover:text-primary-text">
              忘记密码？
            </Link>
          </div>

          <Button type="submit" block size="lg" disabled={loading} loading={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                登录中…
              </span>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-brown-secondary">
            还没有账号？{' '}
            <Link to="/register" className="text-primary-text hover:text-primary-text font-medium">
              立即注册
            </Link>
          </p>
        </div>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-brown-muted">其他登录方式</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <Button
              type="button"
              variant="ghost"
              aria-label="使用微信登录"
              disabled={loading}
              onClick={() => void loginWithThirdParty('wechat')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-brand-wechat text-white hover:brightness-95"
            >
              <BrandSocialIcon platform="wechat" size={ICON_SIZE.action} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="使用微博登录"
              disabled={loading}
              onClick={() => void loginWithThirdParty('weibo')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-brand-weibo text-white hover:brightness-95"
            >
              <BrandSocialIcon platform="weibo" size={ICON_SIZE.action} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="使用 QQ 登录"
              disabled={loading}
              onClick={() => void loginWithThirdParty('qq')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-brand-qq text-white hover:brightness-95"
            >
              <BrandSocialIcon platform="qq" size={ICON_SIZE.action} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
