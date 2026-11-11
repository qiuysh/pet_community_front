import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChatPage from './chatPage';
import { useUserStore } from '../../stores/userStore';
import type { ChatMessage } from '../../types/social';

const messages: ChatMessage[] = [
  {
    id: 1,
    conversationId: 1,
    fromId: 7,
    toId: 8,
    content: '我发的消息',
    type: 'text',
    status: 1,
    isRecalled: 0,
    createdAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 2,
    conversationId: 1,
    fromId: 8,
    toId: 7,
    content: '对方发的消息',
    type: 'text',
    status: 1,
    isRecalled: 0,
    createdAt: '2026-11-05T10:01:00Z',
  },
];

vi.mock('../../hooks/useChat', () => ({
  useChat: () => ({
    messages,
    loading: false,
    sending: false,
    inputValue: '',
    setInputValue: vi.fn(),
    sendMessage: vi.fn(),
    sendImage: vi.fn(),
    sendVoice: vi.fn(),
    recallMessage: vi.fn(),
    highlightedMessageId: null,
    messagesContainerRef: { current: null },
    messagesEndRef: { current: null },
    scrollToMessage: vi.fn(),
    loadMore: vi.fn(),
    hasMore: false,
    loadingMore: false,
  }),
}));

vi.mock('../../hooks/useMessageSearch', () => ({
  useMessageSearch: () => ({
    keyword: '',
    status: 'idle',
    results: [],
    total: 0,
    loadingMore: false,
    hasMore: false,
    error: null,
    reset: vi.fn(),
    search: vi.fn(),
    loadMore: vi.fn(),
    retry: vi.fn(),
  }),
}));

vi.mock('../../api/user', () => ({
  getPublicProfile: vi.fn().mockResolvedValue({ id: 8, nickname: '对方', avatar: '' }),
}));

vi.mock('../../utils/toastManager', () => ({
  showInfoToast: vi.fn(),
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/messages/1/8']}>
      <Routes>
        <Route path="/messages/:conversationId/:targetUserId" element={<ChatPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ChatPage 消息归属', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: { id: 7, nickname: '我', avatar: '' } as never,
      isLoggedIn: true,
    });
  });

  afterEach(() => {
    useUserStore.setState({ user: null, isLoggedIn: false });
    localStorage.clear();
  });

  it('自己发的消息渲染为 sent 气泡，对方消息渲染为 received', () => {
    const { container } = renderPage();

    const sent = container.querySelectorAll('.message-item.sent');
    const received = container.querySelectorAll('.message-item.received');

    expect(sent).toHaveLength(1);
    expect(received).toHaveLength(1);
    expect(sent[0].textContent).toContain('我发的消息');
  });

  it('归属判定不依赖 localStorage.user_id（该键从未写入）', () => {
    // 旧实现读 localStorage，塞一个干扰值：正确的实现应完全忽略它
    localStorage.setItem('user_id', '999');

    const { container } = renderPage();

    expect(container.querySelectorAll('.message-item.sent')).toHaveLength(1);
    expect(container.querySelectorAll('.message-item.sent')[0].textContent).toContain('我发的消息');
  });
});
