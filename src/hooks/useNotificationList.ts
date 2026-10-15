import { useState } from 'react';
import { notificationApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { showErrorToast } from '../utils/toastManager';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  triggerType: string;
  triggerID: number;
  triggerUserID: number;
  isRead: number;
  createdAt: string;
}

/**
 * 通知列表 hook
 *
 * 支持分页追加模式(page>1 追加到已有列表),
 * 提供 markAsRead / markAllAsRead 操作(本地更新)。
 *
 * 用法:
 *   const { notifications, loading, total, page, setPage, markAsRead, markAllAsRead } = useNotificationList();
 */
export function useNotificationList(pageSize = 20) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { loading } = useAsyncEffect(
    () => notificationApi.getNotifications({ page, pageSize }) as Promise<{ list: NotificationItem[]; total: number }>,
    [page],
    {
      onError: (error) => {
        console.error('获取通知列表失败', error);
        showErrorToast('获取通知列表失败');
      },
      onSuccess: (res) => {
        if (page === 1) {
          setNotifications(res.list || []);
        } else {
          setNotifications(prev => [...prev, ...(res.list || [])]);
        }
        setTotal(res.total || 0);
      },
    },
  );

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
    } catch (error) {
      console.error('标记已读失败', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
    } catch (error) {
      console.error('全部已读失败', error);
      showErrorToast('全部已读失败');
    }
  };

  return {
    notifications,
    loading,
    total,
    page,
    setPage,
    markAsRead,
    markAllAsRead,
  };
}
