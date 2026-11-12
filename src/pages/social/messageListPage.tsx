import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, MessageCircle } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useConversationList } from '../../hooks/useConversationList';
import { useNavUnreadCounts } from '../../hooks/useNavUnreadCounts';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { formatRelativeTime } from '../../utils/format';
import { Avatar } from '../../components/ui/avatar';
import { buttonClass } from '../../components/ui/button';
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
          <div className="conversation-info flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
        </div>
      ))}
    </>
  );
}

const MessageListPage: React.FC = () => {
  const { conversations, loading } = useConversationList();
  const { notificationUnread } = useNavUnreadCounts();

  return (
    <div className="message-list-page">
      <PageHeader
        title="消息"
        fallbackTo="/"
        right={
          <div className="flex items-center gap-1">
            <Link
              to="/notifications"
              className={buttonClass({
                variant: 'ghost',
                size: 'sm',
                className: 'h-10 w-10 rounded-full p-0 relative',
              })}
              aria-label={
                notificationUnread > 0
                  ? `通知，${notificationUnread}条未读`
                  : '通知'
              }
            >
              <Bell size={ICON_SIZE.nav} strokeWidth={iconStroke(ICON_SIZE.nav)} aria-hidden="true" />
              {notificationUnread > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              )}
            </Link>
            <Link
              to="/messages/new"
              className={buttonClass({
                variant: 'ghost',
                size: 'sm',
                className: 'h-10 w-10 rounded-full p-0',
              })}
              aria-label="新建私信"
            >
              <Plus size={ICON_SIZE.nav} strokeWidth={iconStroke(ICON_SIZE.nav)} aria-hidden="true" />
            </Link>
          </div>
        }
      />

      {loading && conversations.length === 0 ? (
        <div className="conversation-list">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={ICON_SIZE.empty} strokeWidth={iconStroke(ICON_SIZE.empty)} />}
          title="暂无私信"
          description="找个小伙伴打个招呼吧"
          action={
            <Link to="/messages/new" className={buttonClass()}>
              发起对话
            </Link>
          }
        />
      ) : (
        <div className="conversation-list">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to={`/messages/${conv.id}/${conv.targetUser.id}`}
              className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
            >
              <Avatar
                className="user-avatar"
                src={conv.targetUser.avatar || getDefaultUserAvatar()}
                name={conv.targetUser.nickname}
                alt={conv.targetUser.nickname}
              />
              <div className="conversation-info min-w-0">
                <div className="conversation-header">
                  <span className="page-section-title user-name truncate">{conv.targetUser.nickname}</span>
                  <span className="message-time shrink-0">
                    {formatRelativeTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="last-message truncate">{conv.lastMessage}</div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge tabular-nums">{conv.unreadCount}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageListPage;
