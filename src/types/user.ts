export interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  gender: number;
  signature: string;
  location: string;
  petYears: string;
  status: number;
  level?: number;
  /** Lv10 专属昵称标识 */
  isVipName?: boolean;
}

export interface UserRegisterRequest {
  phone?: string;
  email?: string;
  password: string;
  code: string;
  nickname?: string;
}

export interface UserLoginRequest {
  account: string;
  password?: string;
  code?: string;
  loginType: 'password' | 'code';
  /** 记住登录：后端 RefreshToken 7d；否则 ≤2h */
  remember?: boolean;
}

export interface UserLoginResponse {
  token: string;
  refreshToken: string;
  deviceId?: string;
  user: UserInfo;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface SendCodeRequest {
  account: string;
  type: 'register' | 'login' | 'reset_password' | 'change_password' | 'bind_phone' | 'bind_email';
}

export interface SendCodeResponse {
  expiresIn: number;
  /** 未配置短信/邮件时返回，便于联调 */
  debugCode?: string;
}

/** 公开个人主页（不含手机号/邮箱） */
export interface PublicUserProfile {
  id: number;
  nickname: string;
  avatar: string;
  gender: number;
  signature: string;
  location: string;
  petYears: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  petsCount: number;
  level?: number;
  isVipName?: boolean;
}

export interface UserProfileUpdateRequest {
  nickname?: string;
  avatar?: string;
  signature?: string;
  gender?: number;
  location?: string;
  petYears?: string;
}

/** 关注状态（GET /api/v1/social/follow/status/:id） */
export interface FollowStatus {
  isFollowing: boolean;
  /** 当前关注是否为悄悄关注（仅本人可见） */
  isSecret: boolean;
  /** 互相关注 */
  isMutual: boolean;
  followersCount: number;
  followingCount: number;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  account: string;
  code: string;
  newPassword: string;
}

export interface LogoutRequest {
  deviceId?: string;
}

export interface DeviceInfo {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ip: string;
  lastActiveAt: string;
}

export interface PrivacySettings {
  postVisibility: number;
  commentPermission: number;
  messagePermission: number;
}

export interface PrivacySettingsUpdateRequest {
  postVisibility?: number;
  commentPermission?: number;
  messagePermission?: number;
}

export interface ThirdPartyLoginRequest {
  platform: 'wechat' | 'weibo' | 'qq';
  code: string;
}

export interface ThirdPartyBindRequest {
  platform: string;
  phone: string;
  code: string;
}

export interface ThirdPartyLoginResponse {
  token?: string;
  refreshToken?: string;
  user?: UserInfo;
  needBind: boolean;
  platform: string;
}

export interface UserListParams {
  keyword?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  list: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
}
