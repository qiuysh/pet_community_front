import { useEffect, useState } from 'react';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { showInfoToast } from '../../utils/toastManager';
import { SettingsIcon } from '../../components/settings/settingsIcons';
import { BrandSocialIcon, type BrandSocialPlatform } from '../../components/icons/brandSocialIcons';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { VerificationCodeModal } from '../../components/profile/verificationCodeModal';
import { Button } from '../../components/ui/button';
import { FieldLabel, Input, Select, Textarea } from '../../components/ui/input';
import { Radio, RadioGroup } from '../../components/ui/radio';
import { Monitor, Smartphone } from 'lucide-react';
import './profileSettingsPage.scss';

type TabType = 'profile' | 'password' | 'privacy' | 'devices' | 'bindings';

export function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const {
    loading,
    user,
    nickname, setNickname,
    signature, setSignature,
    gender, setGender,
    location, setLocation,
    petYears, setPetYears,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    privacy, setPrivacy, privacyLoaded, loadPrivacy, handleSavePrivacy,
    devices, devicesLoaded, loadDevices, handleRemoveDevice,
    bindAction, setBindAction,
    handleUpdateProfile,
    handleChangePassword,
    handleBindSubmit,
  } = useProfileSettings();

  useEffect(() => {
    if (activeTab === 'privacy' && !privacyLoaded) {
      loadPrivacy();
    }
    if (activeTab === 'devices' && !devicesLoaded) {
      loadDevices();
    }
  }, [activeTab, privacyLoaded, devicesLoaded, loadPrivacy, loadDevices]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'profile', label: '基本资料' },
    { key: 'password', label: '修改密码' },
    { key: 'privacy', label: '隐私设置' },
    { key: 'devices', label: '登录设备' },
    { key: 'bindings', label: '账号绑定' },
  ];

  const renderMenuItems = (variant: 'sidebar' | 'mobile') =>
    tabs.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <li key={tab.key}>
          <button
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`menu-item menu-item--${variant} ${active ? 'active' : ''}`}
            aria-current={active ? 'true' : undefined}
          >
            <span className="menu-icon" aria-hidden="true">
              <SettingsIcon type={tab.key} size={variant === 'mobile' ? 20 : 18} />
            </span>
            <span className="menu-label">{tab.label}</span>
            {variant === 'sidebar' && (
              <span className="menu-arrow" aria-hidden="true">›</span>
            )}
          </button>
        </li>
      );
    });

  return (
    <div className="profile-settings-page">
      <div className="settings-container">
        <h1 className="page-title">账号设置</h1>

        <div className="settings-layout">
          <nav className="settings-sidebar" aria-label="设置分类">
            <div className="sidebar-user">
              <img
                src={user?.avatar || getDefaultUserAvatar()}
                alt=""
                className="sidebar-avatar"
              />
              <div className="sidebar-user-info">
                <div className="sidebar-nickname">{user?.nickname || '用户'}</div>
                <div className="sidebar-bio">{user?.signature || '设置你的个性签名'}</div>
              </div>
            </div>

            <ul className="sidebar-menu">{renderMenuItems('sidebar')}</ul>
          </nav>

          <nav className="settings-mobile-menu" aria-label="设置分类">
            <ul className="mobile-menu-list">{renderMenuItems('mobile')}</ul>
          </nav>

          <div className="settings-content">
            <div className="content-card">
              {activeTab === 'profile' && (
                <div className="form-wrapper">
                  <div className="avatar-section">
                    <img
                      src={user?.avatar || getDefaultUserAvatar()}
                      alt="avatar"
                      className="form-avatar"
                    />
                    <div className="avatar-actions">
                      <Button type="button" variant="outline" size="sm">
                        更换头像
                      </Button>
                      <p className="form-hint">支持 JPG、PNG 格式，小于 2MB</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <FieldLabel>昵称</FieldLabel>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="请输入昵称"
                      maxLength={20}
                    />
                  </div>

                  <div className="form-group">
                    <FieldLabel>性别</FieldLabel>
                    <RadioGroup
                      name="gender"
                      aria-label="性别"
                      value={String(gender)}
                      onChange={(v) => setGender(Number(v))}
                    >
                      {[
                        { value: 0, label: '保密' },
                        { value: 1, label: '男' },
                        { value: 2, label: '女' },
                      ].map((option) => (
                        <Radio key={option.value} value={String(option.value)}>
                          {option.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="form-group">
                    <FieldLabel>个性签名</FieldLabel>
                    <Textarea
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="介绍一下自己吧…"
                      rows={3}
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <FieldLabel>所在地</FieldLabel>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="请输入所在城市"
                    />
                  </div>

                  <div className="form-group">
                    <FieldLabel>养宠年限</FieldLabel>
                    <Select value={petYears} onChange={(e) => setPetYears(e.target.value)}>
                      <option value="">请选择</option>
                      <option value="less_than_1">1年以内</option>
                      <option value="1_3">1-3年</option>
                      <option value="3_5">3-5年</option>
                      <option value="5_10">5-10年</option>
                      <option value="more_than_10">10年以上</option>
                    </Select>
                  </div>

                  <Button block className="mt-4" disabled={loading} onClick={handleUpdateProfile}>
                    {loading ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="form-wrapper">
                  <div className="form-group">
                    <FieldLabel>原密码</FieldLabel>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="请输入原密码"
                    />
                  </div>
                  <div className="form-group">
                    <FieldLabel>新密码</FieldLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请输入6-20位新密码"
                    />
                  </div>
                  <div className="form-group">
                    <FieldLabel>确认新密码</FieldLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
                    />
                  </div>
                  <Button block className="mt-4" disabled={loading} onClick={handleChangePassword}>
                    {loading ? '修改中...' : '确认修改'}
                  </Button>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="form-wrapper">
                  <div className="privacy-section">
                    <h3 className="section-title">帖子可见范围</h3>
                    <p className="section-desc">设置谁可以看到你的帖子</p>
                    <RadioGroup
                      name="postVisibility"
                      aria-label="帖子可见范围"
                      orientation="vertical"
                      className="radio-cards gap-2"
                      value={String(privacy.postVisibility)}
                      onChange={(v) =>
                        setPrivacy((p) => ({ ...p, postVisibility: Number(v) }))
                      }
                    >
                      {['所有人可见', '仅粉丝可见', '仅自己可见'].map((label, index) => (
                        <Radio key={index} value={String(index)} variant="card">
                          {label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="privacy-section">
                    <h3 className="section-title">评论权限</h3>
                    <p className="section-desc">设置谁可以评论你的帖子</p>
                    <RadioGroup
                      name="commentPermission"
                      aria-label="评论权限"
                      orientation="vertical"
                      className="radio-cards gap-2"
                      value={String(privacy.commentPermission)}
                      onChange={(v) =>
                        setPrivacy((p) => ({ ...p, commentPermission: Number(v) }))
                      }
                    >
                      {['所有人', '仅粉丝', '禁止评论'].map((label, index) => (
                        <Radio key={index} value={String(index)} variant="card">
                          {label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="privacy-section">
                    <h3 className="section-title">私信权限</h3>
                    <p className="section-desc">设置谁可以给你发私信</p>
                    <RadioGroup
                      name="messagePermission"
                      aria-label="私信权限"
                      orientation="vertical"
                      className="radio-cards gap-2"
                      value={String(privacy.messagePermission)}
                      onChange={(v) =>
                        setPrivacy((p) => ({ ...p, messagePermission: Number(v) }))
                      }
                    >
                      {['所有人', '仅粉丝', '禁止私信'].map((label, index) => (
                        <Radio key={index} value={String(index)} variant="card">
                          {label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>
                  <Button block className="mt-4" disabled={loading} onClick={handleSavePrivacy}>
                    {loading ? '保存中...' : '保存隐私设置'}
                  </Button>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="form-wrapper">
                  <div className="device-list">
                    {devices.length === 0 ? (
                      <p className="form-hint text-center">暂无登录设备记录</p>
                    ) : (
                      devices.map((device) => {
                        const isMobile = /mobile|iphone|android/i.test(
                          `${device.deviceType} ${device.deviceName}`,
                        );
                        return (
                          <div key={device.deviceId || device.id} className="device-item">
                            <div className="device-icon">
                              {isMobile ? (
                                <Smartphone size={22} strokeWidth={1.8} />
                              ) : (
                                <Monitor size={22} strokeWidth={1.8} />
                              )}
                            </div>
                            <div className="device-info">
                              <div className="device-name">{device.deviceName || '未知设备'}</div>
                              <div className="device-meta">
                                {device.deviceType || 'web'} · {device.ip || '-'} · {device.lastActiveAt || '-'}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="device-action"
                              onClick={() => handleRemoveDevice(device.deviceId)}
                            >
                              下线
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="form-hint text-center">
                    为了您的账号安全，请定期检查登录设备
                  </p>
                </div>
              )}

              {activeTab === 'bindings' && (
                <div className="form-wrapper">
                  <div className="binding-list">
                    {[
                      {
                        name: '微信',
                        status: '未绑定',
                        color: 'wechat',
                        action: '去绑定',
                        onClick: () => showInfoToast('微信绑定暂未开放,敬请期待'),
                      },
                      {
                        name: '微博',
                        status: '未绑定',
                        color: 'weibo',
                        action: '去绑定',
                        onClick: () => showInfoToast('微博绑定暂未开放,敬请期待'),
                      },
                      {
                        name: 'QQ',
                        status: '未绑定',
                        color: 'qq',
                        action: '去绑定',
                        onClick: () => showInfoToast('QQ 绑定暂未开放,敬请期待'),
                      },
                      {
                        name: '手机号',
                        status: user?.phone || '未绑定',
                        color: 'phone',
                        action: user?.phone ? '更换' : '去绑定',
                        onClick: () =>
                          setBindAction({
                            channel: 'phone',
                            mode: 'bind',
                          }),
                      },
                      {
                        name: '邮箱',
                        status: user?.email || '未绑定',
                        color: 'email',
                        action: user?.email ? '更换' : '去绑定',
                        onClick: () =>
                          setBindAction({
                            channel: 'email',
                            mode: 'bind',
                          }),
                      },
                    ].map((item) => (
                      <div key={item.name} className={`binding-item binding-${item.color}`}>
                        <div className="binding-icon">
                          <BindingIcon name={item.name} />
                        </div>
                        <div className="binding-info">
                          <div className="binding-name">{item.name}</div>
                          <div className="binding-status">{item.status}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="binding-action"
                          onClick={item.onClick}
                        >
                          {item.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <VerificationCodeModal
        open={bindAction !== null}
        onClose={() => setBindAction(null)}
        mode={bindAction?.mode ?? 'bind'}
        channel={bindAction?.channel ?? 'phone'}
        currentValue={
          bindAction?.channel === 'phone'
            ? user?.phone
            : bindAction?.channel === 'email'
              ? user?.email
              : undefined
        }
        onSubmit={handleBindSubmit}
      />
    </div>
  );
}

const BRAND_BINDING_PLATFORMS: Record<string, BrandSocialPlatform> = {
  微信: 'wechat',
  微博: 'weibo',
  QQ: 'qq',
};

const BindingIcon = ({ name }: { name: string }) => {
  const brandPlatform = BRAND_BINDING_PLATFORMS[name];
  if (brandPlatform) {
    return <BrandSocialIcon platform={brandPlatform} size={20} />;
  }

  const strokeIcons: Record<string, React.ReactElement> = {
    手机号: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M12 18h.01" />
      </>
    ),
    邮箱: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {strokeIcons[name] || strokeIcons['邮箱']}
    </svg>
  );
};
