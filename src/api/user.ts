import { get, post, put, del } from './axios';
import {
  UserInfo,
  UserRegisterRequest,
  UserLoginRequest,
  UserLoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  UserProfileUpdateRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  LogoutRequest,
  DeviceInfo,
  UserListParams,
  UserListResponse,
  RefreshTokenResponse,
  ThirdPartyLoginRequest,
  ThirdPartyBindRequest,
  ThirdPartyLoginResponse,
  PrivacySettings,
  PrivacySettingsUpdateRequest,
  PublicUserProfile,
} from '../types/user';

export const register = async (data: UserRegisterRequest): Promise<UserInfo> => {
  return await post<UserInfo>('/api/v1/auth/register', data);
};

export const login = async (data: UserLoginRequest): Promise<UserLoginResponse> => {
  return await post<UserLoginResponse>('/api/v1/auth/login', data);
};

export const sendCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  return await post<SendCodeResponse>('/api/v1/auth/send-code', data);
};

export const resetPassword = async (data: PasswordResetRequest): Promise<void> => {
  return await post<void>('/api/v1/auth/reset-password', data);
};

export const logout = async (data: LogoutRequest = {}): Promise<void> => {
  return await post<void>('/api/v1/auth/logout', data);
};

export const getProfile = async (): Promise<UserInfo> => {
  return await get<UserInfo>('/api/v1/user/profile');
};

/** 公开个人主页 */
export const getPublicProfile = async (userId: number): Promise<PublicUserProfile> => {
  return await get<PublicUserProfile>(`/api/v1/users/${userId}/profile`);
};

export const updateProfile = async (data: UserProfileUpdateRequest): Promise<UserInfo> => {
  return await put<UserInfo>('/api/v1/user/profile', data);
};

/** 上传用户头像（multipart field=file，≤2MB），成功后返回更新后的用户资料 */
export const uploadAvatar = async (file: File): Promise<UserInfo> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UserInfo>('/api/v1/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  } as any);
};

export const changePassword = async (data: PasswordChangeRequest): Promise<void> => {
  return await put<void>('/api/v1/user/password', data);
};

export const getDevices = async (): Promise<DeviceInfo[]> => {
  return await get<DeviceInfo[]>('/api/v1/user/devices');
};

export const removeDevice = async (deviceId: string): Promise<void> => {
  return await del<void>(`/api/v1/user/devices/${encodeURIComponent(deviceId)}`);
};

export const getUserList = async (params: UserListParams): Promise<UserListResponse> => {
  return await get<UserListResponse>('/api/v1/admin/users-list', { params });
};

export const updateUserStatus = async (id: number, status: number): Promise<void> => {
  return await put<void>(`/api/v1/admin/users/${id}/status`, { status });
};

export const refreshTokenApi = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  return await post<RefreshTokenResponse>('/api/v1/auth/refresh-token', { refreshToken });
};

export const thirdPartyLogin = async (data: ThirdPartyLoginRequest): Promise<ThirdPartyLoginResponse> => {
  return await post<ThirdPartyLoginResponse>('/api/v1/auth/third-party-login', data);
};

export const thirdPartyBind = async (data: ThirdPartyBindRequest): Promise<UserLoginResponse> => {
  return await post<UserLoginResponse>('/api/v1/auth/third-party-bind', data);
};

export interface ThirdPartyAccountInfo {
  platform: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export const listThirdPartyAccounts = async (): Promise<ThirdPartyAccountInfo[]> => {
  return await get<ThirdPartyAccountInfo[]>('/api/v1/user/third-party');
};

export const bindThirdPartyAccount = async (
  platform: 'wechat' | 'weibo' | 'qq',
  code: string,
): Promise<void> => {
  return await post<void>('/api/v1/user/third-party/bind', { platform, code });
};

export const unbindThirdPartyAccount = async (platform: string): Promise<void> => {
  return await del<void>(`/api/v1/user/third-party/${encodeURIComponent(platform)}`);
};

export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  return await get<PrivacySettings>('/api/v1/user/privacy');
};

export const updatePrivacySettings = async (data: PrivacySettingsUpdateRequest): Promise<PrivacySettings> => {
  return await put<PrivacySettings>('/api/v1/user/privacy', data);
};

export const unbindPhone = async (code: string): Promise<void> => {
  return await post<void>('/api/v1/user/unbind-phone', { code });
};

export const unbindEmail = async (code: string): Promise<void> => {
  return await post<void>('/api/v1/user/unbind-email', { code });
};

/**
 * 绑定或更换手机号
 * @param phone 新手机号
 * @param code  验证码 (type=bind_phone)
 */
export const bindPhone = async (phone: string, code: string): Promise<UserInfo> => {
  return await post<UserInfo>('/api/v1/user/bind-phone', { phone, code });
};

/**
 * 绑定或更换邮箱
 * @param email 新邮箱
 * @param code  验证码 (type=bind_email)
 */
export const bindEmail = async (email: string, code: string): Promise<UserInfo> => {
  return await post<UserInfo>('/api/v1/user/bind-email', { email, code });
};
