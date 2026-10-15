import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageApi } from '../api/social';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';
import { useAsync } from './useAsync';

/**
 * 发起对话 hook
 *
 * 后端 SendMessage 在会话不存在时会自动创建,并返回包含 conversationId 的 message。
 * 因此前端无需独立"创建会话"接口:发送首条消息后从响应中取 conversationId 跳转即可。
 *
 * 用法:
 *   const { start, loading } = useStartConversation();
 *   await start(targetUserId, '你好,在宠友社区看到你的帖子...');
 */
export function useStartConversation() {
  const navigate = useNavigate();
  const { loading, run } = useAsync();

  const start = useCallback(
    (targetUserId: number, content: string) => {
      run(
        () => messageApi.sendMessage({ toId: targetUserId, content }) as Promise<{ conversationId: number; id: number }>,
        (msg) => {
          showSuccessToast('消息已发送');
          // 跳转到对话页:路径参数顺序与现有 chatPage 路由保持一致
          navigate(`/messages/${msg.conversationId}/${targetUserId}`, { replace: true });
        },
        (err) => {
          showErrorToast((err as Error)?.message || '发送失败,请稍后重试');
        },
      );
    },
    [run, navigate],
  );

  return { start, loading };
}
