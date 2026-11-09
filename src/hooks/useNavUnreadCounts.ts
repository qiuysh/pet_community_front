import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { messageApi, notificationApi } from '../api/social';
import { useUserStore } from '../stores/userStore';

const POLL_MS = 60_000;

export interface NavUnreadCounts {
  messageUnread: number;
  notificationUnread: number;
  refresh: () => void;
}

/**
 * 顶栏未读角标（M2-05 / M5-03）：拉取私信与通知未读数，
 * 登录后轮询；进入消息/通知页后立即刷新。
 */
export function useNavUnreadCounts(): NavUnreadCounts {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const location = useLocation();
  const [messageUnread, setMessageUnread] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);

  const refresh = useCallback(() => {
    if (!isLoggedIn) {
      setMessageUnread(0);
      setNotificationUnread(0);
      return;
    }
    void messageApi
      .getUnreadCount()
      .then((res) => setMessageUnread(Math.max(0, Number(res?.count) || 0)))
      .catch(() => {
        /* 角标失败静默，避免打扰主导航 */
      });
    void notificationApi
      .getUnreadCount()
      .then((res) => setNotificationUnread(Math.max(0, Number(res?.count) || 0)))
      .catch(() => {
        /* 同上 */
      });
  }, [isLoggedIn]);

  useEffect(() => {
    refresh();
    if (!isLoggedIn) return;
    const timer = window.setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [isLoggedIn, refresh]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (
      location.pathname.startsWith('/messages') ||
      location.pathname.startsWith('/notifications')
    ) {
      refresh();
    }
  }, [isLoggedIn, location.pathname, refresh]);

  return { messageUnread, notificationUnread, refresh };
}
