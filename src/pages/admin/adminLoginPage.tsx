import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useAdminStore } from '../../stores/adminStore';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
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
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
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
            <ShieldCheck
              size={ICON_SIZE.feature}
              strokeWidth={iconStroke(ICON_SIZE.feature)}
              className="text-secondary"
              aria-hidden="true"
            />
          </div>
          <h1 className={adminUi.pageTitle}>{siteName}管理后台</h1>
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
            {errors.username ? <AdminHint className="text-error-text">{errors.username}</AdminHint> : null}
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
            {errors.password ? <AdminHint className="text-error-text">{errors.password}</AdminHint> : null}
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
            <span className="text-sm text-brown-muted">忘记密码请联系超级管理员重置</span>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error-text text-sm">
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
            <span className="text-secondary">后台账号由超级管理员创建</span>
          </p>
        </div>
      </div>
    </div>
  );
}
