import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { validators, validateForm } from '../../utils/validators';
import {
  getRememberedAdminUsername,
  isAdminRemembered,
  setRememberedAdminUsername,
} from '../../utils/authStorage';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminHint, AdminInput, AdminLabel } from '../../components/admin/adminField';
import { adminUi } from '../../styles/adminUi';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => getRememberedAdminUsername());
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(
    () => isAdminRemembered() || !!getRememberedAdminUsername(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error, fetchPublicKey } = useAdminStore();

  useEffect(() => {
    fetchPublicKey();
  }, [fetchPublicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { username, password };
    const validationRules = {
      username: [
        validators.required('请输入用户名'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(50, '用户名最多50个字符'),
      ],
      password: [
        validators.required('请输入密码'),
        validators.minLength(6, '密码至少6个字符'),
        validators.maxLength(50, '密码最多50个字符'),
      ],
    };

    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const success = await login({ username, password }, { remember });

    if (success) {
      setRememberedAdminUsername(remember ? username : null);
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-light/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="bg-white rounded-md shadow-card w-full max-w-md p-8 relative animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary-soft rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className={adminUi.pageTitle}>宠物社区管理后台</h1>
          <p className="text-brown-secondary mt-2">请登录您的管理员账号</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <AdminLabel htmlFor="admin-username">用户名</AdminLabel>
            <AdminInput
              id="admin-username"
              type="text"
              value={username}
              invalid={!!errors.username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: '' }));
                }
              }}
              placeholder="请输入用户名…"
              autoComplete="username"
              name="username"
              spellCheck={false}
              className="h-11 px-4"
            />
            {errors.username ? <AdminHint className="text-error">{errors.username}</AdminHint> : null}
          </div>

          <div className="mb-6">
            <AdminLabel htmlFor="admin-password">密码</AdminLabel>
            <AdminInput
              id="admin-password"
              type="password"
              value={password}
              invalid={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              placeholder="请输入密码…"
              autoComplete="current-password"
              name="password"
              className="h-11 px-4"
            />
            {errors.password ? <AdminHint className="text-error">{errors.password}</AdminHint> : null}
          </div>

          <div className="flex items-center justify-between mb-6">
            <AdminCheckbox
              id="admin-remember-me"
              name="admin_remember_me"
              checked={remember}
              onChange={setRemember}
            >
              记住我
            </AdminCheckbox>
            <a href="#" className="text-sm text-secondary hover:text-secondary-dark font-medium">
              忘记密码？
            </a>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}

          <AdminButton type="submit" variant="secondary" block size="lg" disabled={isLoading} loading={isLoading}>
            {isLoading ? '登录中…' : '登录'}
          </AdminButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-brown-muted">
            还没有账号？{' '}
            <a href="#" className="text-secondary hover:text-secondary-dark font-medium">
              联系管理员
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
