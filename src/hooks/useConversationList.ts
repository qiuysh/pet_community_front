import { messageApi } from '../api/social';
import { useAsyncEffect } from './useAsync';

export interface Conversation {
  id: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  targetUser: {
    id: number;
    nickname: string;
    avatar: string;
  };
}

/**
 * 消息列表(会话列表) hook
 *
 * 拉取当前用户的会话列表,供 messageListPage 使用。
 *
 * 用法:
 *   const { conversations, loading } = useConversationList();
 */
export function useConversationList(pageSize = 50) {
  const { loading, data } = useAsyncEffect(
    () => messageApi.getConversations({ page: 1, pageSize }) as Promise<{ list: Conversation[] }>,
    [],
    { onError: (error) => console.error('获取消息列表失败', error) },
  );

  const conversations: Conversation[] = data?.list ?? [];

  return { conversations, loading };
}
