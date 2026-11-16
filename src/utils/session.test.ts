import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyUserAuth,
  clearUserSession,
  getSessionAccessToken,
  isSessionExpiredCode,
  subscribeSession,
} from './session';

describe('session', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('isSessionExpiredCode 对齐 401 / 1004 / 1005', () => {
    expect(isSessionExpiredCode(401)).toBe(true);
    expect(isSessionExpiredCode(1004)).toBe(true);
    expect(isSessionExpiredCode(1005)).toBe(true);
    expect(isSessionExpiredCode(403)).toBe(false);
    expect(isSessionExpiredCode(1000)).toBe(false);
  });

  it('applyUserAuth 写入 storage 并通知订阅方', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    applyUserAuth('access-1', 'refresh-1', true);

    expect(getSessionAccessToken()).toBe('access-1');
    expect(localStorage.getItem('user_token')).toBe('access-1');
    expect(listener).toHaveBeenCalledWith({
      type: 'user-updated',
      token: 'access-1',
      refreshToken: 'refresh-1',
    });

    unsubscribe();
  });

  it('clearUserSession 清除 storage 并广播 user-cleared', () => {
    applyUserAuth('access-2', 'refresh-2', false);
    const listener = vi.fn();
    subscribeSession(listener);

    clearUserSession();

    expect(getSessionAccessToken()).toBeNull();
    expect(listener).toHaveBeenCalledWith({ type: 'user-cleared' });
  });

  it('取消订阅后不再收到事件', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);
    unsubscribe();

    applyUserAuth('access-3', 'refresh-3', true);

    expect(listener).not.toHaveBeenCalled();
  });
});
