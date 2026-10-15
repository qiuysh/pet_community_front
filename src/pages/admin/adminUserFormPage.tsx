import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { validators, validateForm } from '../../utils/validators';
import {
  AdminRole,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateAdminPasswordRequest,
} from '../../types/admin';

const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: 'super_admin', label: '超级管理员' },
  { value: 'content_admin', label: '内容管理员' },
  { value: 'data_admin', label: '数据管理员' },
  { value: 'service', label: '客服管理员' },
];

function normalizeAdminRole(role: string): AdminRole {
  if (role === 'admin') return 'super_admin';
  if (ADMIN_ROLES.some((r) => r.value === role)) return role as AdminRole;
  return 'content_admin';
}
import { AdminHint, AdminInput, AdminLabel, AdminSelect } from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { adminUi } from '../../styles/adminUi';

export function AdminUserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const userId = id ? parseInt(id, 10) : 0;

  const { currentUser, isLoading, error, fetchUserById, createUser, updateUser, updateUserPassword, clearCurrentUser } = useAdminUsers();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('content_admin');
  const [status, setStatus] = useState<0 | 1>(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && userId) {
      fetchUserById(userId);
    } else {
      clearCurrentUser();
    }
  }, [isEdit, userId]);

  useEffect(() => {
    if (currentUser && isEdit) {
      setUsername(currentUser.username);
      setEmail(currentUser.email || '');
      setRole(normalizeAdminRole(currentUser.role));
      setStatus(currentUser.status === 1 ? 1 : 0);
    }
  }, [currentUser, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData: Record<string, string> = {
      username,
      email,
      role,
    };

    const validationRules: any = {
      username: [
        validators.required('请输入用户名'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(50, '用户名最多50个字符'),
      ],
      email: [
        validators.maxLength(100, '邮箱最多100个字符'),
      ],
      role: [
        validators.required('请选择角色'),
      ],
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
        (value: string) => value !== password ? '两次密码输入不一致' : null,
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
        (value: string) => value !== password ? '两次密码输入不一致' : null,
      ];
    }

    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
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
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center text-sm text-brown-secondary hover:text-brown transition-colors focus:outline-none focus-visible:underline"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-card animate-fadeIn">
        <div className="px-6 py-6">
          <h1 className={`${adminUi.pageTitle} mb-6`}>
            {isEdit ? '编辑运营人员' : '添加运营人员'}
          </h1>

          {error && (
            <div className="mb-6 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <AdminLabel htmlFor="admin-form-username">用户名</AdminLabel>
              <AdminInput
                id="admin-form-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors(prev => ({ ...prev, username: '' }));
                  }
                }}
                invalid={!!errors.username}
                placeholder="请输入用户名…"
                autoComplete="username"
                spellCheck={false}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-error">{errors.username}</p>
              )}
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
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                invalid={!!errors.email}
                placeholder="请输入邮箱…"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            <div>
              <AdminLabel htmlFor="admin-form-role">角色</AdminLabel>
              <AdminSelect
                id="admin-form-role"
                name="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as AdminRole);
                  if (errors.role) {
                    setErrors(prev => ({ ...prev, role: '' }));
                  }
                }}
                invalid={!!errors.role}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </AdminSelect>
              {errors.role && (
                <p className="mt-1 text-sm text-error">{errors.role}</p>
              )}
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
                      }
                    }}
                  >
                    修改密码
                  </AdminCheckbox>
                </div>

                {changePassword && (
                  <div className="space-y-6 border-t border-border-light pt-6">
                    <div>
                      <AdminLabel>新密码</AdminLabel>
                      <AdminInput
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors(prev => ({ ...prev, password: '' }));
                          }
                        }}
                        invalid={!!errors.password}
                        placeholder="请输入新密码…"
                        autoComplete="new-password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-error">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <AdminLabel>确认新密码</AdminLabel>
                      <AdminInput
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            setErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }
                        }}
                        invalid={!!errors.confirmPassword}
                        placeholder="请确认新密码…"
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  <AdminLabel>密码</AdminLabel>
                  <AdminInput
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    invalid={!!errors.password}
                    placeholder="请输入密码…"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-error">{errors.password}</p>
                  )}
                </div>

                <div>
                  <AdminLabel>确认密码</AdminLabel>
                  <AdminInput
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    invalid={!!errors.confirmPassword}
                    placeholder="请确认密码…"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                取消
              </AdminButton>
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
