import React from 'react';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import './notificationSettingsPage.scss';

const NotificationSettingsPage: React.FC = () => {
  const { settings, loading, toggleSetting } = useNotificationSettings();

  const settingsList = [
    { key: 'likeNotify' as const, title: '点赞通知', description: '收到点赞时通知' },
    { key: 'commentNotify' as const, title: '评论通知', description: '收到评论时通知' },
    { key: 'atNotify' as const, title: '@提及通知', description: '被@时通知' },
    { key: 'followNotify' as const, title: '关注通知', description: '被关注时通知' },
    { key: 'systemNotify' as const, title: '系统通知', description: '系统消息通知' },
  ];

  return (
    <div className="notification-settings-page">
      <PageHeader title="通知设置" fallbackTo="/notifications" />

      {loading ? (
        <div className="settings-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="setting-item">
              <div className="setting-info flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="settings-list">
          {settingsList.map((item) => (
            <div key={item.key} className="setting-item">
              <div className="setting-info">
                <div className="setting-title">{item.title}</div>
                <div className="setting-desc">{item.description}</div>
              </div>
              <Switch
                checked={settings[item.key] === 1}
                onChange={() => toggleSetting(item.key)}
                aria-label={item.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsPage;
