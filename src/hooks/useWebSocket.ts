import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '../stores/userStore';
import type { IncomingChatMessage } from '../types/social';

type MessageCallback = (message: IncomingChatMessage) => void;

/**
 * 私信实时推送。
 *
 * 约定：
 * - 回调放在 ref 里，调用方传内联函数也不会触发重连；
 * - 卸载时关闭 socket 且不再重连（避免组件已卸载仍反复建连）；
 * - 断线按指数退避重连（上限 30s），重连成功后退避归零。
 */
export function useWebSocket(onMessage?: MessageCallback) {
  const socketRef = useRef<WebSocket | null>(null);
  const { token } = useUserStore();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const reconnectRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  const connect = useCallback(() => {
    if (!token || closedRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as IncomingChatMessage;
        onMessageRef.current?.(message);
      } catch (error) {
        console.error('[WebSocket] 消息解析失败', error);
      }
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] 连接异常', error);
    };

    socket.onclose = () => {
      if (closedRef.current) return;
      reconnectRef.current += 1;
      const delay = Math.min(2 ** reconnectRef.current * 1000, 30000);
      timerRef.current = setTimeout(connect, delay);
    };

    socketRef.current = socket;
  }, [token]);

  useEffect(() => {
    closedRef.current = false;
    connect();

    return () => {
      closedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onclose = null; // 主动关闭不触发重连
        socket.close();
      }
    };
  }, [connect]);
}
