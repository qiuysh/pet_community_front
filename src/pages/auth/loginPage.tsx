import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import { showErrorToast, showInfoToast } from '../../utils/toastManager';
import {
  getRememberedUserAccount,
  isUserRemembered,
} from '../../utils/authStorage';
import { UserLoginRequest } from '../../types/user';
import { Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { BrandSocialIcon } from '../../components/icons/brandSocialIcons';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [account, setAccount] = useState(() => getRememberedUserAccount());
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(() => isUserRemembered() || !!getRememberedUserAccount());
  const { loading, login } = useAuth();
  const { countdown, send: sendCodeNow } = useVerificationCode();

  const handleSendCode = () => {
    sendCodeNow(account, 'login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      showErrorToast('请输入手机号或邮箱');
      return;
    }
    if (loginType === 'password' && !password) {
      showErrorToast('请输入密码');
      return;
    }
    if (loginType === 'code' && !code) {
      showErrorToast('请输入验证码');
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-soft/80 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <Card className="w-full max-w-md relative animate-fadeIn" padding="md">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-brown">欢迎来到宠物社区</h1>
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

        <form onSubmit={handleSubmit}>
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
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入手机号或邮箱…"
            />
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码…"
              />
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
                  onChange={(e) => setCode(e.target.value)}
                  className="min-w-0 flex-1"
                  placeholder="请输入验证码…"
                  maxLength={6}
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
            <Link to="/reset-password" className="text-sm text-primary hover:text-primary-dark">
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
            <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
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
              onClick={() => showInfoToast('微信登录暂未开放,请使用账号密码登录')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-[#07C160] text-white hover:bg-[#06AD56]"
            >
              <BrandSocialIcon platform="wechat" size={20} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="使用微博登录"
              onClick={() => showInfoToast('微博登录暂未开放,请使用账号密码登录')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-[#E6162D] text-white hover:bg-[#CF1428]"
            >
              <BrandSocialIcon platform="weibo" size={20} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="使用 QQ 登录"
              onClick={() => showInfoToast('QQ 登录暂未开放,请使用账号密码登录')}
              className="w-10 h-10 min-w-0 p-0 rounded-full shadow-soft border-0 bg-[#12B7F5] text-white hover:bg-[#0FA3DB]"
            >
              <BrandSocialIcon platform="qq" size={20} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
