import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { validators, validateForm } from '../../utils/validators';
import {
  AdminRole,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateAdminPasswordRequest,
} from '../../types/admin';
import { FieldError } from '../../components/ui';
import { AdminHint, AdminInput, AdminLabel, AdminSelect } from '../../components/admin/adminField';
import { AdminButton, adminButtonClass } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { adminUi } from '../../styles/adminUi';

const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: 'super_admin', label: '超级管理员' },
  { value: 'content_admin', label: '内容管理员' },
  { value: 'data_admin', label: '数据管理员' },
  { value: 'service', label: '客服管理员' },
];

const FORM_FIELDS = ['username', 'email', 'role', 'password', 'confirmPassword'] as const;

function normalizeAdminRole(role: string): AdminRole {
  if (role === 'admin') return 'super_admin';
  if (ADMIN_ROLES.some((r) => r.value === role)) return role as AdminRole;
  return 'content_admin';
}

export function AdminUserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const userId = id ? parseInt(id, 10) : 0;

  const {
    currentUser,
    isLoading,
    error,
    fetchUserById,
    createUser,
    updateUser,
    updateUserPassword,
    clearCurrentUser,
  } = useAdminUsers();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('content_admin');
  const [status, setStatus] = useState<0 | 1>(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [baselineReady, setBaselineReady] = useState(!isEdit);
  const { errors, showErrors, clearError, formRef } = useFormErrors(FORM_FIELDS);

  useEffect(() => {
    if (isEdit && userId) {
      fetchUserById(userId);
    } else {
      clearCurrentUser();
      setBaselineReady(true);
    }
  }, [isEdit, userId]);

  useEffect(() => {
    if (currentUser && isEdit) {
      setUsername(currentUser.username);
      setEmail(currentUser.email || '');
      setRole(normalizeAdminRole(currentUser.role));
      setStatus(currentUser.status === 1 ? 1 : 0);
      setBaselineReady(true);
    }
  }, [currentUser, isEdit]);

  const isDirty = useMemo(() => {
    if (!baselineReady) return false;
    if (!isEdit) {
      return Boolean(
        username ||
          email ||
          password ||
          confirmPassword ||
          role !== 'content_admin' ||
          status !== 1,
      );
    }
    if (!currentUser) return false;
    const baseRole = normalizeAdminRole(currentUser.role);
    const baseStatus = currentUser.status === 1 ? 1 : 0;
    return (
      username !== currentUser.username ||
      email !== (currentUser.email || '') ||
      role !== baseRole ||
      status !== baseStatus ||
      (changePassword && (password.length > 0 || confirmPassword.length > 0))
    );
  }, [
    baselineReady,
    isEdit,
    currentUser,
    username,
    email,
    role,
    status,
    changePassword,
    password,
    confirmPassword,
  ]);

  const unsavedDialog = useUnsavedChanges(isDirty && !isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: Record<string, string> = {
      username,
      email,
      role,
    };

    const validationRules: Record<string, ReturnType<typeof validators.required>[]> = {
      username: [
        validators.required('请输入用户名'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(50, '用户名最多50个字符'),
      ],
      email: [validators.maxLength(100, '邮箱最多100个字符')],
      role: [validators.required('请选择角色')],
    };

    if (!isEdit) {
      formData.password = password;
      formData.confirmPassword = confirmPassword;
      validationRules.password = [
        validators.required('请输入密码'),
        validators.minLength(6, '密码至少6个字符'),
        validators.maxLength(50, '密码最多50个字符'),
      ];
      validationRules.confirmPassword = [
        validators.required('请确认密码'),
        {
          validator: (value: string) => value === password,
          message: '两次密码输入不一致',
        },
      ];
    }

    if (isEdit && changePassword) {
      formData.password = password;
      formData.confirmPassword = confirmPassword;
      validationRules.password = [
        validators.required('请输入新密码'),
        validators.minLength(6, '密码至少6个字符'),
        validators.maxLength(50, '密码最多50个字符'),
      ];
      validationRules.confirmPassword = [
        validators.required('请确认密码'),
        {
          validator: (value: string) => value === password,
          message: '两次密码输入不一致',
        },
      ];
    }

    const formErrors = validateForm(formData, validationRules) as FormErrors<
      (typeof FORM_FIELDS)[number]
    >;
    if (Object.keys(formErrors).length > 0) {
      showErrors(formErrors);
      return;
    }

    let success: boolean;

    if (isEdit) {
      const updateData: UpdateAdminRequest = {
        username,
        role,
        status,
      };
      if (email) {
        updateData.email = email;
      }
      success = await updateUser(userId, updateData);

      if (success && changePassword) {
        const passwordData: UpdateAdminPasswordRequest = {
          password,
        };
        success = await updateUserPassword(userId, passwordData);
      }
    } else {
      const createData: CreateAdminRequest = {
        username,
        password,
        role,
        status,
      };
      if (email) {
        createData.email = email;
      }
      success = await createUser(createData);
    }

    if (success) {
      navigate('/admin/users');
    }
  };

  return (
    <div className="w-full">
      {unsavedDialog}
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center text-sm text-brown-secondary hover:text-brown transition-colors focus:outline-none focus-visible:underline"
        >
          <ChevronLeft
            size={ICON_SIZE.inline}
            strokeWidth={iconStroke(ICON_SIZE.inline)}
            className="mr-1"
            aria-hidden="true"
          />
          返回列表
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-card animate-fadeIn">
        <div className="px-6 py-6">
          <h1 className={`${adminUi.pageTitle} mb-6 text-balance`}>
            {isEdit ? '编辑后台账号' : '新建后台账号'}
          </h1>

          {error && (
            <div
              className="mb-6 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error-text text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} ref={formRef} className="space-y-6" noValidate>
            <div>
              <AdminLabel htmlFor="admin-form-username">用户名</AdminLabel>
              <AdminInput
                id="admin-form-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError('username');
                }}
                invalid={!!errors.username}
                placeholder="请输入用户名…"
                autoComplete="username"
                spellCheck={false}
                aria-describedby={errors.username ? 'admin-form-username-error' : undefined}
              />
              <FieldError id="admin-form-username-error">{errors.username}</FieldError>
            </div>

            <div>
              <AdminLabel htmlFor="admin-form-email">邮箱（选填）</AdminLabel>
              <AdminInput
                id="admin-form-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                invalid={!!errors.email}
                placeholder="请输入邮箱…"
                autoComplete="email"
                spellCheck={false}
                aria-describedby={errors.email ? 'admin-form-email-error' : undefined}
              />
              <FieldError id="admin-form-email-error">{errors.email}</FieldError>
            </div>

            <div>
              <AdminLabel htmlFor="admin-form-role">角色</AdminLabel>
              <AdminSelect
                id="admin-form-role"
                name="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as AdminRole);
                  clearError('role');
                }}
                invalid={!!errors.role}
                aria-describedby={errors.role ? 'admin-form-role-error' : undefined}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </AdminSelect>
              <FieldError id="admin-form-role-error">{errors.role}</FieldError>
            </div>

            <div>
              <AdminLabel htmlFor="admin-form-status">状态</AdminLabel>
              <AdminSelect
                id="admin-form-status"
                name="status"
                value={status}
                onChange={(e) => {
                  setStatus(Number(e.target.value) as 0 | 1);
                }}
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </AdminSelect>
              <AdminHint>禁用后该账号将无法登录</AdminHint>
            </div>

            {isEdit ? (
              <div>
                <div className="mb-4">
                  <AdminCheckbox
                    id="changePassword"
                    name="changePassword"
                    checked={changePassword}
                    onChange={(checked) => {
                      setChangePassword(checked);
                      if (!checked) {
                        setPassword('');
                        setConfirmPassword('');
                        clearError('password');
                        clearError('confirmPassword');
                      }
                    }}
                  >
                    修改密码
                  </AdminCheckbox>
                </div>

                {changePassword && (
                  <div className="space-y-6 border-t border-border-light pt-6">
                    <div>
                      <AdminLabel htmlFor="admin-form-password" required>
                        新密码
                      </AdminLabel>
                      <AdminInput
                        id="admin-form-password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError('password');
                        }}
                        invalid={!!errors.password}
                        placeholder="请输入新密码…"
                        autoComplete="new-password"
                        aria-describedby={errors.password ? 'admin-form-password-error' : undefined}
                      />
                      <FieldError id="admin-form-password-error">{errors.password}</FieldError>
                    </div>

                    <div>
                      <AdminLabel htmlFor="admin-form-confirm-password" required>
                        确认新密码
                      </AdminLabel>
                      <AdminInput
                        id="admin-form-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearError('confirmPassword');
                        }}
                        invalid={!!errors.confirmPassword}
                        placeholder="请确认新密码…"
                        autoComplete="new-password"
                        aria-describedby={
                          errors.confirmPassword ? 'admin-form-confirm-password-error' : undefined
                        }
                      />
                      <FieldError id="admin-form-confirm-password-error">
                        {errors.confirmPassword}
                      </FieldError>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  <AdminLabel htmlFor="admin-form-password" required>
                    密码
                  </AdminLabel>
                  <AdminInput
                    id="admin-form-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    invalid={!!errors.password}
                    placeholder="请输入密码…"
                    autoComplete="new-password"
                    aria-describedby={errors.password ? 'admin-form-password-error' : undefined}
                  />
                  <FieldError id="admin-form-password-error">{errors.password}</FieldError>
                </div>

                <div>
                  <AdminLabel htmlFor="admin-form-confirm-password" required>
                    确认密码
                  </AdminLabel>
                  <AdminInput
                    id="admin-form-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                    }}
                    invalid={!!errors.confirmPassword}
                    placeholder="请确认密码…"
                    autoComplete="new-password"
                    aria-describedby={
                      errors.confirmPassword ? 'admin-form-confirm-password-error' : undefined
                    }
                  />
                  <FieldError id="admin-form-confirm-password-error">
                    {errors.confirmPassword}
                  </FieldError>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Link to="/admin/users" className={adminButtonClass({ variant: 'outline' })}>
                取消
              </Link>
              <AdminButton
                type="submit"
                variant="secondary"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? '保存中…' : '保存'}
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
