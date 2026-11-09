import { useEffect, useState } from 'react';
import { getFrontUserById, getFrontUserOperationLogs } from '../../api/admin';
import type { AdminOperationLog, FrontUser } from '../../types/admin';
import { Modal } from '../ui/modal';
import { Spinner } from '../ui/spinner';
import { AdminChip } from './adminChip';

interface FrontUserDetailDialogProps {
  userId: number | null;
  onClose: () => void;
}

const genderText = (gender: number) => {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '保密';
};

const statusText = (status: number) => (status === 2 ? '已封禁' : status === 1 ? '正常' : '未知');

/** 前台用户详情：基础资料 + 最近操作轨迹（数据来自 /admin/front-users/:id 与 /admin/front-users/logs） */
export const FrontUserDetailDialog = ({ userId, onClose }: FrontUserDetailDialogProps) => {
  const [user, setUser] = useState<FrontUser | null>(null);
  const [logs, setLogs] = useState<AdminOperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLogs([]);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const [detail, logPage] = await Promise.all([
          getFrontUserById(userId),
          getFrontUserOperationLogs({ userId, page: 1, limit: 10 }).catch(() => ({ list: [], total: 0 })),
        ]);
        if (cancelled) return;
        setUser(detail);
        setLogs(logPage.list ?? []);
      } catch (err) {
        if (!cancelled) setError((err as Error).message || '加载用户详情失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const rows: Array<[string, string]> = user
    ? [
        ['用户 ID', String(user.id)],
        ['手机号', user.phone || '-'],
        ['邮箱', user.email || '-'],
        ['性别', genderText(user.gender)],
        ['所在地', user.location || '-'],
        ['养宠年限', user.petYears || '-'],
        ['个性签名', user.signature || '-'],
        ['注册时间', user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '-'],
      ]
    : [];

  return (
    <Modal open={Boolean(userId)} onClose={onClose} title="用户详情" size="md">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-error-text">{error}</p>
      ) : user ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-lg font-semibold text-secondary">
              {user.nickname?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-medium text-brown">{user.nickname || `用户${user.id}`}</div>
              <AdminChip tone={user.status === 2 ? 'danger' : 'success'}>{statusText(user.status)}</AdminChip>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-brown-muted">{label}</dt>
                <dd className="truncate text-brown-secondary">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h4 className="mb-2 text-sm font-medium text-brown">最近操作</h4>
            {logs.length === 0 ? (
              <p className="text-xs text-brown-muted">暂无操作记录</p>
            ) : (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li key={log.id} className="rounded border border-border-light/60 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-brown-secondary">{log.action}</span>
                      <span className="text-brown-muted">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('zh-CN') : ''}
                      </span>
                    </div>
                    {log.detail && <p className="mt-1 text-brown-muted line-clamp-2">{log.detail}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
