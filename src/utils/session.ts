/**
 * 前台用户 session module。
 *
 * 单一 locality：写入 / 清除登录态后通知所有订阅方（userStore、私信 WebSocket）。
 * HTTP adapter 与 UI 不得各自只改 storage 或只改 Zustand。
 */

import {
  clearUserAuth,
  getRefreshToken,
  getUserToken,
  setUserAuth,
} from './authStorage';

/** 与 server/types/errors.go 对齐的会话失效业务码 */
export const SESSION_EXPIRED_CODES = new Set([401, 1004, 1005]);

export function isSessionExpiredCode(code: number): boolean {
  return SESSION_EXPIRED_CODES.has(code);
}

export type SessionEvent =
  | { type: 'user-updated'; token: string; refreshToken: string | null }
  | { type: 'user-cleared' };

type SessionListener = (event: SessionEvent) => void;

const listeners = new Set<SessionListener>();

export function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(event: SessionEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('[session] listener failed', err);
    }
  });
}

/** REST / WS 共用的 access token 读取（storage 为权威源） */
export function getSessionAccessToken(): string | null {
  return getUserToken();
}

/**
 * 写入用户登录态并广播。
 * refreshToken / remember / deviceId 语义与 setUserAuth 一致。
 */
export function applyUserAuth(
  token: string,
  refreshToken?: string | null,
  remember?: boolean,
  deviceId?: string | null,
): void {
  setUserAuth(token, refreshToken, remember, deviceId);
  notify({
    type: 'user-updated',
    token,
    refreshToken: getRefreshToken(),
  });
}

/** 清除用户登录态并广播（不影响管理端） */
export function clearUserSession(): void {
  clearUserAuth();
  notify({ type: 'user-cleared' });
}
