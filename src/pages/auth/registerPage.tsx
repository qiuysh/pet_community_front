import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import { showErrorToast } from '../../utils/toastManager';
import { UserRegisterRequest } from '../../types/user';
import { UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';

export function RegisterPage() {
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

  const account = registerType === 'phone' ? phone : email;

  const handleSendCode = () => {
    sendCodeNow(account, 'register');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      showErrorToast(registerType === 'phone' ? '请输入手机号' : '请输入邮箱');
      return;
    }
    if (!password) {
      showErrorToast('请输入密码');
      return;
    }
    if (password.length < 6) {
      showErrorToast('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast('两次密码输入不一致');
      return;
    }
    if (!code) {
      showErrorToast('请输入验证码');
      return;
    }
    if (!agreeTerms) {
      showErrorToast('请阅读并同意用户协议和隐私政策');
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
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-brown">加入宠物社区</h1>
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

        <form onSubmit={handleSubmit}>
          {registerType === 'phone' ? (
            <div className="mb-3">
              <FieldLabel>手机号</FieldLabel>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                maxLength={11}
              />
            </div>
          ) : (
            <div className="mb-3">
              <FieldLabel>邮箱</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
              />
            </div>
          )}

          <div className="mb-3">
            <FieldLabel>验证码</FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-w-0 flex-1"
                placeholder="请输入验证码"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <Button
                type="button"
                variant="outline"
                disabled={countdown > 0}
                onClick={handleSendCode}
                className="shrink-0"
              >
                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <FieldLabel>昵称（选填）</FieldLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="给自己起个昵称吧"
              maxLength={20}
            />
          </div>

          <div className="mb-3">
            <FieldLabel>密码</FieldLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请设置6-20位密码"
            />
          </div>

          <div className="mb-4">
            <FieldLabel>确认密码</FieldLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
            />
          </div>

          <div className="mb-4">
            <Checkbox checked={agreeTerms} onChange={setAgreeTerms} className="items-start">
              我已阅读并同意
              <a href="#" className="text-primary hover:text-primary-dark">
                《用户协议》
              </a>
              和
              <a href="#" className="text-primary hover:text-primary-dark">
                《隐私政策》
              </a>
            </Checkbox>
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
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
