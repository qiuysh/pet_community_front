import { useState, useEffect, useCallback } from 'react';
import {
  updateProfile,
  changePassword,
  bindPhone,
  bindEmail,
  unbindPhone,
  unbindEmail,
  getPrivacySettings,
  updatePrivacySettings,
  getDevices,
  removeDevice,
} from '../api/user';
import { useUserStore } from '../stores/userStore';
import { useAsync } from './useAsync';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';
import {
  UserProfileUpdateRequest,
  PasswordChangeRequest,
  UserInfo,
  PrivacySettings,
  DeviceInfo,
} from '../types/user';
import { VerificationChannel, VerificationMode } from '../components/profile/verificationCodeModal';

export type BindActionState = {
  channel: VerificationChannel;
  mode: VerificationMode;
} | null;

/**
 * 个人资料设置 hook
 *
 * 管理:
 * - 资料更新(updateProfile -> 写 user store)
 * - 修改密码(changePassword -> 成功后清空表单)
 * - 账号绑定(bindPhone/bindEmail/unbindPhone/unbindEmail -> 通过 VerificationCodeModal 触发)
 *
 * 用法:
 *   const { loading, user, nickname, setNickname, ..., handleUpdateProfile, handleChangePassword, bindAction, setBindAction, handleBindSubmit } = useProfileSettings();
 */
export function useProfileSettings() {
  const { user, setUser, fetchProfile } = useUserStore();
  const { loading, run } = useAsync();
  const [bindAction, setBindAction] = useState<BindActionState>(null);

  const [nickname, setNickname] = useState('');
  const [signature, setSignature] = useState('');
  const [gender, setGender] = useState(0);
  const [location, setLocation] = useState('');
  const [petYears, setPetYears] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    postVisibility: 0,
    commentPermission: 0,
    messagePermission: 0,
  });
  const [privacyLoaded, setPrivacyLoaded] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [devicesLoaded, setDevicesLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchProfile();
    } else {
      setNickname(user.nickname);
      setSignature(user.signature || '');
      setGender(user.gender || 0);
      setLocation(user.location || '');
      setPetYears(user.petYears || '');
    }
  }, [user, fetchProfile]);

  const loadPrivacy = useCallback(async () => {
    try {
      const settings = await getPrivacySettings();
      setPrivacy(settings);
      setPrivacyLoaded(true);
    } catch {
      showErrorToast('获取隐私设置失败');
    }
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const list = await getDevices();
      setDevices(Array.isArray(list) ? list : []);
      setDevicesLoaded(true);
    } catch {
      showErrorToast('获取设备列表失败');
    }
  }, []);

  const handleSavePrivacy = () => {
    run(
      () => updatePrivacySettings(privacy),
      (updated) => {
        setPrivacy(updated);
        showSuccessToast('隐私设置已保存');
      },
      (err: unknown) => showErrorToast((err as Error).message || '保存失败'),
    );
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!window.confirm('确定将该设备下线？')) return;
    try {
      await removeDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      showSuccessToast('设备已下线');
    } catch (err) {
      showErrorToast((err as Error).message || '下线失败');
    }
  };

  const handleUpdateProfile = () => {
    const data: UserProfileUpdateRequest = {
      nickname: nickname || undefined,
      signature: signature || undefined,
      gender: gender || undefined,
      location: location || undefined,
      petYears: petYears || undefined,
    };
    run(
      () => updateProfile(data),
      (updated) => {
        useUserStore.getState().setUser(updated);
        showSuccessToast('资料更新成功');
      },
      (err: unknown) => showErrorToast((err as Error).message || '更新失败'),
    );
  };

  const handleChangePassword = () => {
    if (!oldPassword) {
      showErrorToast('请输入原密码');
      return;
    }
    if (!newPassword) {
      showErrorToast('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast('新密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('两次密码输入不一致');
      return;
    }

    const data: PasswordChangeRequest = { oldPassword, newPassword };
    run(
      () => changePassword(data),
      () => {
        showSuccessToast('密码修改成功');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
      (err: unknown) => showErrorToast((err as Error).message || '修改失败'),
    );
  };

  const handleBindSubmit = async (account: string, code: string): Promise<void> => {
    if (!bindAction) return;
    try {
      if (bindAction.channel === 'phone') {
        if (bindAction.mode === 'unbind') {
          await unbindPhone(code);
        } else {
          const updated: UserInfo = await bindPhone(account, code);
          setUser(updated);
        }
      } else {
        if (bindAction.mode === 'unbind') {
          await unbindEmail(code);
        } else {
          const updated: UserInfo = await bindEmail(account, code);
          setUser(updated);
        }
      }
      showSuccessToast(bindAction.mode === 'unbind' ? '解绑成功' : '绑定成功');
      setBindAction(null);
    } catch (err: unknown) {
      showErrorToast((err as Error).message || '操作失败');
      throw err;
    }
  };

  return {
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
  };
}
