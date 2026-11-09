import { useEffect, useRef, useState } from 'react';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { useConfirm } from '../../hooks/useConfirm';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { SettingsIcon } from '../../components/settings/settingsIcons';
import { BrandSocialIcon, type BrandSocialPlatform } from '../../components/icons/brandSocialIcons';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { VerificationCodeModal } from '../../components/profile/verificationCodeModal';
import { Button } from '../../components/ui/button';
import { FieldError, FieldLabel, Input, Select, Textarea } from '../../components/ui/input';
import { Radio, RadioGroup } from '../../components/ui/radio';
import { Mail, Monitor, Smartphone } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import './profileSettingsPage.scss';

type TabType = 'profile' | 'password' | 'privacy' | 'devices' | 'bindings';

export function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const {
    loading,
    dirtyTabs,
    user,
    nickname, setNickname,
    signature, setSignature,
    gender, setGender,
    location, setLocation,
    petYears, setPetYears,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    fieldErrors, clearFieldError,
    privacy, setPrivacy, privacyLoaded, loadPrivacy, handleSavePrivacy,
    devices, devicesLoaded, loadDevices, handleRemoveDevice,
    thirdPartyLoaded, loadThirdParty,
    isThirdPartyBound, handleBindThirdParty, handleUnbindThirdParty,
    bindAction, setBindAction,
    handleUpdateProfile,
    handleAvatarChange,
    handleChangePassword,
    handleBindSubmit,
  } = useProfileSettings();
  const { confirm, confirmDialog } = useConfirm();

  const handleRemoveDeviceWithConfirm = async (deviceId: string, deviceName?: string) => {
    const confirmed = await confirm({
      title: '将该设备下线？',
      description: `${deviceName || '该设备'}的登录状态将立即失效，需要重新登录才能继续使用。`,
      confirmText: '下线',
    });
    if (confirmed) await handleRemoveDevice(deviceId);
  };

  const PLATFORM_LABEL = { wechat: '微信', weibo: '微博', qq: 'QQ' } as const;

  const handleThirdPartyAction = async (platform: 'wechat' | 'weibo' | 'qq') => {
    if (!isThirdPartyBound(platform)) {
      await handleBindThirdParty(platform);
      return;
    }
    const confirmed = await confirm({
      title: `解绑${PLATFORM_LABEL[platform]}？`,
      description: '解绑后无法再用该账号快捷登录，需要改用手机号或邮箱登录。',
      confirmText: '解绑',
    });
    if (!confirmed) return;
    await handleUnbindThirdParty(platform);
  };

  useEffect(() => {
    if (activeTab === 'privacy' && !privacyLoaded) {
      loadPrivacy();
    }
    if (activeTab === 'devices' && !devicesLoaded) {
      loadDevices();
    }
    if (activeTab === 'bindings' && !thirdPartyLoaded) {
      void loadThirdParty();
    }
  }, [activeTab, privacyLoaded, devicesLoaded, thirdPartyLoaded, loadPrivacy, loadDevices, loadThirdParty]);

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

  // 只拦当前 tab 的未保存修改；提交中（loading）不拦，否则保存成功后的跳转会被自己挡下
  const dirty = activeTab in dirtyTabs ? dirtyTabs[activeTab as keyof typeof dirtyTabs] : false;
  const leaveDialog = useUnsavedChanges(dirty && !loading);

  return (
    <div className="profile-settings-page">
      {leaveDialog}
      <div className="settings-container">
        <h1 className="page-title">账号设置</h1>

        <div className="settings-layout">
          <nav className="settings-sidebar" aria-label="设置分类">
            <div className="sidebar-user">
              <img
                decoding="async"
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
                      decoding="async"
                      src={user?.avatar || getDefaultUserAvatar()}
                      alt=""
                      className="form-avatar"
                    />
                    <div className="avatar-actions">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        className="sr-only"
                        aria-hidden="true"
                        tabIndex={-1}
                        onChange={(e) => {
                          handleAvatarChange(e.target.files?.[0] ?? null);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {loading ? '上传中…' : '更换头像'}
                      </Button>
                      <p className="form-hint">支持 JPG、PNG、WebP 格式，小于 2MB</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <FieldLabel htmlFor="ps-nickname">昵称</FieldLabel>
                    <Input
                      id="ps-nickname"
                      name="nickname"
                      autoComplete="nickname"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        clearFieldError('nickname');
                      }}
                      placeholder="请输入昵称…"
                      maxLength={20}
                      invalid={!!fieldErrors.nickname}
                      aria-describedby={fieldErrors.nickname ? 'ps-nickname-error' : undefined}
                    />
                    <FieldError id="ps-nickname-error">{fieldErrors.nickname}</FieldError>
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
                    <FieldLabel htmlFor="ps-signature">个性签名</FieldLabel>
                    <Textarea
                      id="ps-signature"
                      name="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="介绍一下自己吧…"
                      rows={3}
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <FieldLabel htmlFor="ps-location">所在地</FieldLabel>
                    <Input
                      id="ps-location"
                      name="location"
                      autoComplete="address-level2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="请输入所在城市…"
                    />
                  </div>

                  <div className="form-group">
                    <FieldLabel htmlFor="ps-pet-years">养宠年限</FieldLabel>
                    <Select
                      id="ps-pet-years"
                      name="petYears"
                      value={petYears}
                      onChange={(e) => setPetYears(e.target.value)}
                    >
                      <option value="">请选择</option>
                      <option value="less_than_1">1年以内</option>
                      <option value="1_3">1-3年</option>
                      <option value="3_5">3-5年</option>
                      <option value="5_10">5-10年</option>
                      <option value="more_than_10">10年以上</option>
                    </Select>
                  </div>

                  <Button block className="mt-4" disabled={loading} loading={loading} onClick={handleUpdateProfile}>
                    {loading ? '保存中' : '保存修改'}
                  </Button>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="form-wrapper">
                  <div className="form-group">
                    <FieldLabel htmlFor="ps-old-password">原密码</FieldLabel>
                    <Input
                      id="ps-old-password"
                      name="oldPassword"
                      type="password"
                      autoComplete="current-password"
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        clearFieldError('oldPassword');
                      }}
                      placeholder="请输入原密码…"
                      invalid={!!fieldErrors.oldPassword}
                      aria-describedby={fieldErrors.oldPassword ? 'ps-old-password-error' : undefined}
                    />
                    <FieldError id="ps-old-password-error">{fieldErrors.oldPassword}</FieldError>
                  </div>
                  <div className="form-group">
                    <FieldLabel htmlFor="ps-new-password">新密码</FieldLabel>
                    <Input
                      id="ps-new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearFieldError('newPassword');
                      }}
                      placeholder="请输入 6-20 位新密码…"
                      invalid={!!fieldErrors.newPassword}
                      aria-describedby={fieldErrors.newPassword ? 'ps-new-password-error' : undefined}
                    />
                    <FieldError id="ps-new-password-error">{fieldErrors.newPassword}</FieldError>
                  </div>
                  <div className="form-group">
                    <FieldLabel htmlFor="ps-confirm-password">确认新密码</FieldLabel>
                    <Input
                      id="ps-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError('confirmPassword');
                      }}
                      placeholder="请再次输入新密码…"
                      invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'ps-confirm-password-error' : undefined}
                    />
                    <FieldError id="ps-confirm-password-error">{fieldErrors.confirmPassword}</FieldError>
                  </div>
                  <Button block className="mt-4" disabled={loading} loading={loading} onClick={handleChangePassword}>
                    {loading ? '修改中' : '确认修改'}
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
                  <Button block className="mt-4" disabled={loading} loading={loading} onClick={handleSavePrivacy}>
                    {loading ? '保存中' : '保存隐私设置'}
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
                                <Smartphone size={ICON_SIZE.action} strokeWidth={iconStroke(ICON_SIZE.action)} aria-hidden="true" />
                              ) : (
                                <Monitor size={ICON_SIZE.action} strokeWidth={iconStroke(ICON_SIZE.action)} aria-hidden="true" />
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
                              onClick={() => handleRemoveDeviceWithConfirm(device.deviceId, device.deviceName)}
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
                        status: isThirdPartyBound('wechat') ? '已绑定' : '未绑定',
                        color: 'wechat',
                        action: isThirdPartyBound('wechat') ? '解绑' : '去绑定',
                        onClick: () => void handleThirdPartyAction('wechat'),
                      },
                      {
                        name: '微博',
                        status: isThirdPartyBound('weibo') ? '已绑定' : '未绑定',
                        color: 'weibo',
                        action: isThirdPartyBound('weibo') ? '解绑' : '去绑定',
                        onClick: () => void handleThirdPartyAction('weibo'),
                      },
                      {
                        name: 'QQ',
                        status: isThirdPartyBound('qq') ? '已绑定' : '未绑定',
                        color: 'qq',
                        action: isThirdPartyBound('qq') ? '解绑' : '去绑定',
                        onClick: () => void handleThirdPartyAction('qq'),
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

      {confirmDialog}
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
    return <BrandSocialIcon platform={brandPlatform} size={ICON_SIZE.action} />;
  }

  const Icon = name === '手机号' ? Smartphone : Mail;
  return (
    <Icon
      size={ICON_SIZE.action}
      strokeWidth={iconStroke(ICON_SIZE.action)}
      aria-hidden="true"
    />
  );
};
