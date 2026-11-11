import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useConversationList } from '../../hooks/useConversationList';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
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
      <PageHeader
        title="消息"
        fallbackTo="/"
        right={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
            onClick={handleNewMessage}
            aria-label="新建私信"
          >
            <Plus size={ICON_SIZE.nav} strokeWidth={iconStroke(ICON_SIZE.nav)} aria-hidden="true" />
          </Button>
        }
      />

      {loading && conversations.length === 0 ? (
        <div className="conversation-list">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={ICON_SIZE.empty} strokeWidth={1.5} />}
          title="暂无消息"
          action={<Button onClick={handleNewMessage}>发起对话</Button>}
        />
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
                  <span className="page-section-title user-name">{conv.targetUser.nickname}</span>
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
