import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useAdminStore } from '../../stores/adminStore';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { getAdminCaptcha } from '../../api/admin';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { validators, validateForm } from '../../utils/validators';
import {
  getRememberedAdminUsername,
  isAdminRemembered,
  setRememberedAdminUsername,
} from '../../utils/authStorage';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { FieldError } from '../../components/ui';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminHint, AdminInput, AdminLabel } from '../../components/admin/adminField';
import { adminUi } from '../../styles/adminUi';

const LOGIN_FIELDS = ['username', 'password', 'captchaCode'] as const;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
  const [username, setUsername] = useState(() => getRememberedAdminUsername());
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(
    () => isAdminRemembered() || !!getRememberedAdminUsername(),
  );
  const { errors, showErrors, clearError, formRef } = useFormErrors(LOGIN_FIELDS);
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const { login, isLoading, error, fetchPublicKey } = useAdminStore();

  const refreshCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await getAdminCaptcha();
      setCaptchaId(res.captchaId);
      setCaptchaImage(res.captchaImage);
      setCaptchaCode('');
    } catch {
      setCaptchaId('');
      setCaptchaImage('');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicKey();
  }, [fetchPublicKey]);

  useEffect(() => {
    if (requireCaptcha) {
      void refreshCaptcha();
    }
  }, [requireCaptcha, refreshCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { username, password, captchaCode };
    const validationRules: Record<string, ReturnType<typeof validators.required>[]> = {
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
    if (requireCaptcha) {
      validationRules.captchaCode = [validators.required('请输入验证码')];
    }

    const formErrors = validateForm(formData, validationRules) as FormErrors<(typeof LOGIN_FIELDS)[number]>;
    if (Object.keys(formErrors).length > 0) {
      showErrors(formErrors);
      return;
    }

    const result = await login(
      {
        username,
        password,
        captchaId: requireCaptcha ? captchaId : undefined,
        captchaCode: requireCaptcha ? captchaCode : undefined,
      },
      { remember },
    );

    if (result.ok) {
      setRememberedAdminUsername(remember ? username : null);
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (result.requireCaptcha) {
      setRequireCaptcha(true);
      void refreshCaptcha();
    } else if (requireCaptcha) {
      void refreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <a href="#admin-auth-main" className="skip-link">
        跳到主要内容
      </a>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-light/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <main id="admin-auth-main" className="bg-white rounded-md shadow-card w-full max-w-md p-8 relative animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary-soft rounded-sm flex items-center justify-center mx-auto mb-4">
            <ShieldCheck
              size={ICON_SIZE.feature}
              strokeWidth={iconStroke(ICON_SIZE.feature)}
              className="text-secondary-dark"
              aria-hidden="true"
            />
          </div>
          <h1 className={`${adminUi.pageTitle} text-balance`}>{siteName}管理后台</h1>
          <p className="text-brown-secondary mt-2">请登录您的管理员账号</p>
        </div>

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          <div className="mb-4">
            <AdminLabel htmlFor="admin-username">用户名</AdminLabel>
            <AdminInput
              id="admin-username"
              type="text"
              value={username}
              invalid={!!errors.username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError('username');
              }}
              placeholder="请输入用户名…"
              autoComplete="username"
              name="username"
              spellCheck={false}
              className="h-11 px-4"
              aria-describedby={errors.username ? 'admin-username-error' : undefined}
            />
            <FieldError id="admin-username-error">{errors.username}</FieldError>
          </div>

          <div className="mb-4">
            <AdminLabel htmlFor="admin-password">密码</AdminLabel>
            <AdminInput
              id="admin-password"
              type="password"
              value={password}
              invalid={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              placeholder="请输入密码…"
              autoComplete="current-password"
              name="password"
              className="h-11 px-4"
              aria-describedby={errors.password ? 'admin-password-error' : undefined}
            />
            <FieldError id="admin-password-error">{errors.password}</FieldError>
          </div>

          {requireCaptcha && (
            <div className="mb-4">
              <AdminLabel htmlFor="admin-captcha">验证码</AdminLabel>
              <div className="flex gap-2 items-stretch">
                <AdminInput
                  id="admin-captcha"
                  type="text"
                  value={captchaCode}
                  invalid={!!errors.captchaCode}
                  onChange={(e) => {
                    setCaptchaCode(e.target.value.toUpperCase());
                    clearError('captchaCode');
                  }}
                  placeholder="输入图中字符…"
                  autoComplete="off"
                  name="captchaCode"
                  spellCheck={false}
                  className="h-11 px-4 flex-1"
                  maxLength={4}
                  aria-label="图形验证码"
                  aria-describedby={errors.captchaCode ? 'admin-captcha-error' : 'admin-captcha-hint'}
                />
                <button
                  type="button"
                  className="shrink-0 h-11 w-[120px] rounded-md border border-border-light bg-soft overflow-hidden flex items-center justify-center"
                  onClick={() => void refreshCaptcha()}
                  disabled={captchaLoading}
                  aria-label="刷新验证码"
                  title="点击刷新"
                >
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="验证码"
                      width={120}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <RefreshCw
                      size={ICON_SIZE.inline}
                      className={
                        captchaLoading
                          ? 'animate-spin motion-reduce:animate-none text-brown-muted'
                          : 'text-brown-muted'
                      }
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              {errors.captchaCode ? (
                <FieldError id="admin-captcha-error">{errors.captchaCode}</FieldError>
              ) : (
                <AdminHint id="admin-captcha-hint">连续失败后需填写验证码，点击图片可刷新</AdminHint>
              )}
            </div>
          )}

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
            <div
              className="mb-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error-text text-sm"
              role="alert"
              aria-live="assertive"
            >
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
            <span className="text-secondary-dark">后台账号由超级管理员创建</span>
          </p>
        </div>
      </main>
    </div>
  );
}
