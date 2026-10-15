import { useState, useEffect } from 'react';
import { notificationSettingsApi } from '../api/social';
import { useAsync } from './useAsync';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';

export interface NotificationSettings {
  likeNotify: number;
  commentNotify: number;
  atNotify: number;
  followNotify: number;
  systemNotify: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  likeNotify: 1,
  commentNotify: 1,
  atNotify: 1,
  followNotify: 1,
  systemNotify: 1,
};

/**
 * 通知设置 hook
 *
 * 加载设置 -> toggleSetting 乐观更新 + 失败回滚。
 *
 * 用法:
 *   const { settings, loading, toggleSetting } = useNotificationSettings();
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const { loading, run: runFetch } = useAsync();
  const { run: runToggle } = useAsync();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => runFetch(
    () => notificationSettingsApi.getSettings(),
    (res) => {
      setSettings(res as NotificationSettings || DEFAULT_SETTINGS);
    },
    (error) => {
      showErrorToast('获取通知设置失败');
      console.error('获取通知设置失败', error);
    },
  );

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newValue = settings[key] === 1 ? 0 : 1;
    const newSettings = { ...settings, [key]: newValue };
    const oldSettings = { ...settings };
    setSettings(newSettings);

    runToggle(
      () => notificationSettingsApi.updateSettings(newSettings),
      () => {
        showSuccessToast(newValue === 1 ? '已开启通知' : '已关闭通知');
      },
      (error) => {
        showErrorToast('更新通知设置失败');
        console.error('更新通知设置失败', error);
        setSettings(oldSettings);
      },
    );
  };

  return { settings, loading, toggleSetting };
}
