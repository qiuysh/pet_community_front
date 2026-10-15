import { useState } from 'react';
import { Admin, AdminListParams, CreateAdminRequest, UpdateAdminRequest, UpdateAdminPasswordRequest } from '../types/admin';
import {
  getAdminList,
  getAdminById,
  createAdmin,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  updateAdminStatus
} from '../api/admin';
import { useAsync } from '../hooks/useAsync';

export function useAdminUsers() {
  const [users, setUsers] = useState<Admin[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  const { loading: isLoading, run } = useAsync();

  const fetchUserList = async (params?: AdminListParams) => {
    setError('');
    await run(
      () => getAdminList(params),
      (response) => {
        setUsers(response.list);
        setTotal(response.total);
        setCurrentPage(response.page);
        setPageSize(response.page_size);
      },
      (err: unknown) => {
        let errorMessage = '获取用户列表失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
  };

  const fetchUserById = async (id: number) => {
    setError('');
    await run(
      () => getAdminById(id),
      (user) => setCurrentUser(user),
      (err: unknown) => {
        let errorMessage = '获取用户信息失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
  };

  const createUser = async (data: CreateAdminRequest): Promise<boolean> => {
    let ok = false;
    setError('');
    await run(
      () => createAdmin(data),
      () => { ok = true; },
      (err: unknown) => {
        let errorMessage = '创建用户失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
    return ok;
  };

  const updateUser = async (id: number, data: UpdateAdminRequest): Promise<boolean> => {
    let ok = false;
    setError('');
    await run(
      () => updateAdmin(id, data),
      () => { ok = true; },
      (err: unknown) => {
        let errorMessage = '更新用户失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
    return ok;
  };

  const updateUserPassword = async (id: number, data: UpdateAdminPasswordRequest): Promise<boolean> => {
    let ok = false;
    setError('');
    await run(
      () => updateAdminPassword(id, data),
      () => { ok = true; },
      (err: unknown) => {
        let errorMessage = '更新密码失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
    return ok;
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    let ok = false;
    setError('');
    await run(
      () => deleteAdmin(id),
      () => { ok = true; },
      (err: unknown) => {
        let errorMessage = '删除用户失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
    return ok;
  };

  const updateUserStatus = async (id: number, status: 0 | 1): Promise<boolean> => {
    let ok = false;
    setError('');
    await run(
      () => updateAdminStatus(id, { status }),
      () => { ok = true; },
      (err: unknown) => {
        let errorMessage = '更新用户状态失败';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      },
    );
    return ok;
  };

  const clearCurrentUser = () => {
    setCurrentUser(null);
  };

  return {
    users,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    currentUser,
    fetchUserList,
    fetchUserById,
    createUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    updateUserStatus,
    clearCurrentUser
  };
}
