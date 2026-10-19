import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '../stores/userStore';

/** 与后端 service.MessagePayload JSON 字段对齐 */
interface MessagePayload {
  id?: number;
  toId: number;
  fromId: number;
  content: string;
  type: string;
  mediaUrl?: string;
  duration?: number;
}

type MessageCallback = (message: MessagePayload) => void;

export function useWebSocket(onMessage?: MessageCallback) {
  const socketRef = useRef<WebSocket | null>(null);
  const { token } = useUserStore();
  const reconnectRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      reconnectRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const message: MessagePayload = JSON.parse(event.data);
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      reconnectRef.current++;
      const delay = Math.min(Math.pow(2, reconnectRef.current) * 1000, 30000);
      setTimeout(connect, delay);
    };

    socketRef.current = socket;
  }, [token, onMessage]);

  const sendMessage = useCallback((content: string, msgType: string = 'text') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify({
        content,
        type: msgType,
      }));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { sendMessage };
}