/**
 * 登录态持久化工具（用户端 / 管理端完全隔离）
 *
 * 记住我 = true  → localStorage（跨会话，配合 RefreshToken 约 7 天）
 * 记住我 = false → sessionStorage（关闭浏览器即失效）
 *
 * 两侧使用独立 key，任一端的登录、登出、过期清理都不得改写另一端。
 */

const USER_TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DEVICE_KEY = 'user_device_id';
const ADMIN_TOKEN_KEY = 'admin_token';
const REMEMBER_USER_KEY = 'auth_remember_user';
const REMEMBER_ADMIN_KEY = 'auth_remember_admin';
const REMEMBERED_USER_ACCOUNT_KEY = 'auth_remembered_user_account';
const REMEMBERED_ADMIN_USERNAME_KEY = 'auth_remembered_admin_username';

function readFromStorages(key: string): string | null {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

function clearFromStorages(key: string): void {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

function resolveStorage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

/** 当前用户是否开启了「记住我」 */
export function isUserRemembered(): boolean {
  return localStorage.getItem(REMEMBER_USER_KEY) === '1';
}

/** 当前管理员是否开启了「记住我」 */
export function isAdminRemembered(): boolean {
  return localStorage.getItem(REMEMBER_ADMIN_KEY) === '1';
}

export function getUserToken(): string | null {
  return readFromStorages(USER_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readFromStorages(REFRESH_TOKEN_KEY);
}

export function getUserDeviceId(): string | null {
  return readFromStorages(USER_DEVICE_KEY);
}

export function getAdminToken(): string | null {
  return readFromStorages(ADMIN_TOKEN_KEY);
}

/**
 * 写入用户登录态。
 * @param remember 显式传入时按该值选择存储；省略时沿用已有「记住我」偏好（默认 session）
 */
export function setUserAuth(
  token: string | null,
  refreshToken?: string | null,
  remember?: boolean,
  deviceId?: string | null,
): void {
  if (!token) {
    clearFromStorages(USER_TOKEN_KEY);
    clearFromStorages(REFRESH_TOKEN_KEY);
    clearFromStorages(USER_DEVICE_KEY);
    return;
  }

  const preferRemember = remember ?? isUserRemembered();
  const existingRefresh = getRefreshToken();
  const existingDevice = getUserDeviceId();
  clearFromStorages(USER_TOKEN_KEY);
  clearFromStorages(REFRESH_TOKEN_KEY);
  clearFromStorages(USER_DEVICE_KEY);

  const storage = resolveStorage(preferRemember);
  storage.setItem(USER_TOKEN_KEY, token);

  // undefined = 保留原 refresh；null = 显式清除；有值则覆盖
  const nextRefresh = refreshToken === undefined ? existingRefresh : refreshToken;
  if (nextRefresh) {
    storage.setItem(REFRESH_TOKEN_KEY, nextRefresh);
  }

  const nextDevice = deviceId === undefined ? existingDevice : deviceId;
  if (nextDevice) {
    storage.setItem(USER_DEVICE_KEY, nextDevice);
  }

  if (remember === true) {
    localStorage.setItem(REMEMBER_USER_KEY, '1');
  } else if (remember === false) {
    localStorage.removeItem(REMEMBER_USER_KEY);
  }
}

/** 仅清除用户 token，不影响管理端，也不清除「记住我」账号偏好 */
export function clearUserAuth(): void {
  clearFromStorages(USER_TOKEN_KEY);
  clearFromStorages(REFRESH_TOKEN_KEY);
  clearFromStorages(USER_DEVICE_KEY);
}

/**
 * 写入管理员登录态。
 * @param remember 显式传入时按该值选择存储；省略时沿用已有「记住我」偏好（默认 session）
 */
export function setAdminAuth(token: string | null, remember?: boolean): void {
  if (!token) {
    clearFromStorages(ADMIN_TOKEN_KEY);
    return;
  }

  const preferRemember = remember ?? isAdminRemembered();
  clearFromStorages(ADMIN_TOKEN_KEY);
  resolveStorage(preferRemember).setItem(ADMIN_TOKEN_KEY, token);

  if (remember === true) {
    localStorage.setItem(REMEMBER_ADMIN_KEY, '1');
  } else if (remember === false) {
    localStorage.removeItem(REMEMBER_ADMIN_KEY);
  }
}

/** 仅清除管理员 token，不影响用户端，也不清除「记住我」账号偏好 */
export function clearAdminAuth(): void {
  clearFromStorages(ADMIN_TOKEN_KEY);
}

export function getRememberedUserAccount(): string {
  return localStorage.getItem(REMEMBERED_USER_ACCOUNT_KEY) || '';
}

export function setRememberedUserAccount(account: string | null): void {
  if (account) {
    localStorage.setItem(REMEMBERED_USER_ACCOUNT_KEY, account);
  } else {
    localStorage.removeItem(REMEMBERED_USER_ACCOUNT_KEY);
  }
}

export function getRememberedAdminUsername(): string {
  return localStorage.getItem(REMEMBERED_ADMIN_USERNAME_KEY) || '';
}

export function setRememberedAdminUsername(username: string | null): void {
  if (username) {
    localStorage.setItem(REMEMBERED_ADMIN_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(REMEMBERED_ADMIN_USERNAME_KEY);
  }
}

export function isAdminApiUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('/admin/') || url.includes('/admin-login') || url.includes('/api/v1/admin');
}
