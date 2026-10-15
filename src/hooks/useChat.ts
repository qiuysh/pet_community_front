import { useState, useRef, useEffect } from 'react';
import { messageApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { showErrorToast } from '../utils/toastManager';

export interface ChatMessage {
  id: number;
  fromId: number;
  toId: number;
  content: string;
  type: string;
  status: number;
  isRecalled: number;
  createdAt: string;
}

/**
 * 单聊页 hook
 *
 * 管理:
 * - 进入会话时 markAsRead(仅触发一次)
 * - 拉取消息列表(page=1, pageSize=100)
 * - 发送消息后刷新列表
 *
 * 用法:
 *   const { messages, loading, inputValue, setInputValue, sendMessage } = useChat(conversationId, targetUserId);
 */
export function useChat(conversationId: number, targetUserId: number) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 进入会话时标记已读(只触发一次)
  useAsyncEffect(
    () => messageApi.markAsRead(conversationId),
    [],
    { onError: (error) => console.error('标记已读失败', error) },
  );

  const { loading, data, refetch } = useAsyncEffect(
    () => messageApi.getMessages(conversationId, { page: 1, pageSize: 100 }) as Promise<{ list: ChatMessage[] }>,
    [],
    { onError: (error) => console.error('获取消息失败', error) },
  );

  const messages: ChatMessage[] = data?.list ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      await messageApi.sendMessage({
        toId: targetUserId,
        content: inputValue.trim(),
        type: 'text',
      });
      setInputValue('');
      refetch();
    } catch (error) {
      console.error('发送消息失败', error);
      showErrorToast('发送消息失败');
    }
  };

  return {
    messages,
    loading,
    inputValue,
    setInputValue,
    sendMessage,
    messagesEndRef,
  };
}
