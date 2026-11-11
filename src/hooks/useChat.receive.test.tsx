import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from './useChat';
import { useUserStore } from '../stores/userStore';

const getMessages = vi.fn();
const markAsRead = vi.fn();

vi.mock('../api/social', () => ({
  messageApi: {
    getMessages: (...args: unknown[]) => getMessages(...args),
    markAsRead: (...args: unknown[]) => markAsRead(...args),
    sendMessage: vi.fn(),
    recallMessage: vi.fn(),
    sendImageMessage: vi.fn(),
    sendVoiceMessage: vi.fn(),
  },
}));

vi.mock('../utils/toastManager', () => ({
  showInfoToast: vi.fn(),
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

describe('useChat 实时消息接收', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: { id: 7, nickname: '我', avatar: '' } as never, isLoggedIn: true });
    getMessages.mockResolvedValue({
      list: [
        {
          id: 2,
          conversationId: 1,
          fromId: 8,
          toId: 7,
          content: '对方消息',
          type: 'text',
          status: 1,
          isRecalled: 0,
          createdAt: '2026-11-05T10:00:00Z',
        },
      ],
      total: 1,
    });
    markAsRead.mockResolvedValue(undefined);
  });

  it('追加当前会话的新消息', async () => {
    const { result } = renderHook(() => useChat(1, 8));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => {
      result.current.receiveMessage({ id: 3, fromId: 8, toId: 7, content: '新消息', type: 'text' });
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages.map((m) => m.content)).toContain('新消息');
  });

  it('按 id 去重，历史里已有的消息不会重复追加', async () => {
    const { result } = renderHook(() => useChat(1, 8));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => {
      result.current.receiveMessage({ id: 2, fromId: 8, toId: 7, content: '对方消息', type: 'text' });
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it('忽略自己发的消息（已由乐观消息承担）', async () => {
    const { result } = renderHook(() => useChat(1, 8));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => {
      result.current.receiveMessage({ id: 4, fromId: 7, toId: 8, content: '我自己发的', type: 'text' });
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it('忽略其他会话的消息', async () => {
    const { result } = renderHook(() => useChat(1, 8));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => {
      result.current.receiveMessage({ id: 5, fromId: 9, toId: 7, content: '别人发来的', type: 'text' });
    });

    expect(result.current.messages).toHaveLength(1);
  });
});
