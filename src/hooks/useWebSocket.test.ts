import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { applyUserAuth, clearUserSession } from '../utils/session';

/** 最小 WebSocket 替身：只记录实例与回调，便于断言连接/重连行为 */
class FakeSocket {
  static instances: FakeSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }

  close() {
    this.closed = true;
    this.onclose?.();
  }
}

describe('useWebSocket', () => {
  beforeEach(() => {
    FakeSocket.instances = [];
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('WebSocket', FakeSocket as unknown as typeof WebSocket);
    act(() => {
      applyUserAuth('token-abc', 'refresh-abc', true);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    act(() => {
      clearUserSession();
    });
  });

  it('登录后建立连接并转发收到的消息', () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket(onMessage));

    expect(FakeSocket.instances).toHaveLength(1);
    expect(FakeSocket.instances[0].url).toContain('/ws?token=token-abc');

    act(() => {
      FakeSocket.instances[0].onmessage?.({
        data: JSON.stringify({ id: 1, fromId: 8, toId: 7, content: 'hi', type: 'text' }),
      });
    });

    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 1, content: 'hi' }));
  });

  it('未登录不建立连接', () => {
    act(() => {
      clearUserSession();
    });
    renderHook(() => useWebSocket(vi.fn()));
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it('session 静默换票后应带着新 token 重连', () => {
    renderHook(() => useWebSocket(vi.fn()));
    expect(FakeSocket.instances).toHaveLength(1);
    expect(FakeSocket.instances[0].url).toContain('token-abc');

    act(() => {
      applyUserAuth('token-refreshed', 'refresh-new');
    });

    expect(FakeSocket.instances.length).toBeGreaterThan(1);
    const latest = FakeSocket.instances[FakeSocket.instances.length - 1];
    expect(latest.url).toContain('/ws?token=token-refreshed');
  });

  it('卸载后关闭连接且不再重连', () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useWebSocket(vi.fn()));
    const socket = FakeSocket.instances[0];

    unmount();

    expect(socket.closed).toBe(true);
    // 关闭回调即使被触发也不能再建新连接（否则组件已卸载仍在后台重连）
    act(() => {
      socket.onclose?.();
      vi.advanceTimersByTime(60000);
    });

    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('意外断线后按退避重连', () => {
    vi.useFakeTimers();
    renderHook(() => useWebSocket(vi.fn()));
    const socket = FakeSocket.instances[0];

    act(() => {
      socket.onclose?.();
      vi.advanceTimersByTime(2000);
    });

    expect(FakeSocket.instances.length).toBeGreaterThan(1);
  });
});
