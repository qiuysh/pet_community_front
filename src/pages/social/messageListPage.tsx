import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MessageCircle } from 'lucide-react';
import { useConversationList } from '../../hooks/useConversationList';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import './messageListPage.scss';

function ConversationListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="conversation-item">
          <Skeleton circle className="user-avatar !rounded-full" />
          <div className="conversation-info flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
        </div>
      ))}
    </>
  );
}

const MessageListPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useConversationList();

  const handleConversationClick = (conversationId: number, targetUserId: number) => {
    navigate(`/messages/${conversationId}/${targetUserId}`);
  };

  const handleNewMessage = () => {
    navigate('/messages/new');
  };

  return (
    <div className="message-list-page">
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">消息</h1>
        <Button type="button" variant="ghost" className="new-btn" onClick={handleNewMessage} aria-label="新建私信">
          <Plus size={24} aria-hidden="true" />
        </Button>
      </div>

      {loading && conversations.length === 0 ? (
        <div className="conversation-list">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <div className="empty">
          <MessageCircle size={64} color="var(--color-ink-light)" strokeWidth={1.5} />
          <p>暂无消息</p>
          <Button type="button" className="start-btn" onClick={handleNewMessage}>
            发起对话
          </Button>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv) => (
            <button
              type="button"
              key={conv.id}
              className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleConversationClick(conv.id, conv.targetUser.id)}
            >
              <Avatar
                className="user-avatar"
                src={conv.targetUser.avatar || getDefaultUserAvatar()}
                name={conv.targetUser.nickname}
                alt={conv.targetUser.nickname}
              />
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="user-name">{conv.targetUser.nickname}</span>
                  <span className="message-time">{conv.lastMessageTime}</span>
                </div>
                <div className="last-message">{conv.lastMessage}</div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageListPage;
