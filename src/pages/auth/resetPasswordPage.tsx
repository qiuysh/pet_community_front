import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVerificationCode } from '../../hooks/useVerificationCode';
import { showErrorToast } from '../../utils/toastManager';
import { Key } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldLabel, Input } from '../../components/ui/input';
import { Spinner } from '../../components/ui/spinner';

export function ResetPasswordPage() {
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, resetPassword } = useAuth();
  const { countdown, send: sendCodeNow } = useVerificationCode();

  const handleSendCode = () => {
    sendCodeNow(account, 'reset_password');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      showErrorToast('请输入手机号或邮箱');
      return;
    }
    if (!code) {
      showErrorToast('请输入验证码');
      return;
    }
    if (!newPassword) {
      showErrorToast('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast('密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('两次密码输入不一致');
      return;
    }

    resetPassword({ account, code, newPassword });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brown">重置密码</h1>
          <p className="text-brown-muted mt-2">输入您的账号信息以重置密码</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <FieldLabel>手机号 / 邮箱</FieldLabel>
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入注册时的手机号或邮箱"
            />
          </div>

          <div className="mb-4">
            <FieldLabel>验证码</FieldLabel>
            <div className="flex gap-3">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1"
                placeholder="请输入验证码"
                maxLength={6}
              />
              <Button type="button" variant="outline" disabled={countdown > 0} onClick={handleSendCode}>
                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <FieldLabel>新密码</FieldLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请设置6-20位新密码"
            />
          </div>

          <div className="mb-6">
            <FieldLabel>确认新密码</FieldLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
            />
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
          <Link to="/login" className="text-sm text-primary hover:text-primary-dark font-medium">
            返回登录
          </Link>
        </div>
      </Card>
    </div>
  );
}
