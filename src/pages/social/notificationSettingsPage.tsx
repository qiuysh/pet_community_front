import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import './notificationSettingsPage.scss';

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">通知设置</h1>
        <div className="placeholder" />
      </div>

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
            <div
              key={item.key}
              className="setting-item"
              onClick={() => toggleSetting(item.key)}
            >
              <div className="setting-info">
                <div className="setting-title">{item.title}</div>
                <div className="setting-desc">{item.description}</div>
              </div>
              <div className={`toggle-switch ${settings[item.key] === 1 ? 'on' : 'off'}`}>
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsPage;
