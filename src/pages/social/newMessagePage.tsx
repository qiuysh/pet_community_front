import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Send, MessageCircle, UserCircle } from 'lucide-react';
import { useFollows } from '../../hooks/useFollows';
import { useStartConversation } from '../../hooks/useStartConversation';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/input';
import './newMessagePage.scss';

/**
 * 发起对话页
 *
 * 路由:/messages/new
 * 查询参数:
 *   - userId: 目标用户 ID (从 userProfilePage 「私信」按钮跳转携带)
 *   - nickname: 目标用户昵称 (用于无后端 /users/:id/profile 接口时的占位显示)
 *
 * 流程:
 *   1. 带 userId 进入: 直接显示消息输入框,提交后 useStartConversation 发送首条消息并跳转到对话页
 *   2. 无 userId 进入: 拉取关注列表,让用户选择目标后再输入消息
 */
const NewMessagePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialUserId = params.get('userId');
  const initialNickname = params.get('nickname') ?? '对方';

  const [targetUser, setTargetUser] = useState<{ id: number; nickname: string } | null>(
    initialUserId ? { id: Number(initialUserId), nickname: initialNickname } : null,
  );
  const [content, setContent] = useState('');
  const { start, loading } = useStartConversation();

  // 关注列表:无 targetUser 时展示供选择
  const { follows, loading: loadingFollows } = useFollows();

  const handleSubmit = () => {
    if (!targetUser) return;
    if (!content.trim()) return;
    start(targetUser.id, content.trim());
  };

  return (
    <div className="new-message-page">
      <div className="page-header">
        <Button
          type="button"
          variant="ghost"
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">发起对话</h1>
        <div className="placeholder" />
      </div>

      {!targetUser ? (
        <div className="follow-list-section">
          <p className="section-tip">请选择要发送消息的宠友</p>
          {loadingFollows ? (
            <div className="follow-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="follow-item">
                  <Skeleton circle className="user-avatar !rounded-full" />
                  <div className="user-info flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : follows.length === 0 ? (
            <div className="empty">
              <UserCircle size={64} color="var(--color-ink-light)" strokeWidth={1.5} aria-hidden="true" />
              <p>暂未关注任何用户</p>
              <Button type="button" className="explore-btn" onClick={() => navigate('/search')}>
                去发现宠友
              </Button>
            </div>
          ) : (
            <div className="follow-list">
              {follows.map((u) => (
                <Button
                  key={u.id}
                  type="button"
                  variant="ghost"
                  className="follow-item"
                  onClick={() => setTargetUser({ id: u.id, nickname: u.nickname })}
                >
                  <Avatar
                    className="user-avatar"
                    src={u.avatar || getDefaultUserAvatar()}
                    name={u.nickname}
                    alt={u.nickname}
                  />
                  <div className="user-info">
                    <div className="user-name">{u.nickname}</div>
                    {u.signature && <div className="user-sig">{u.signature}</div>}
                  </div>
                  <MessageCircle size={18} className="msg-icon" aria-hidden="true" />
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="compose-section">
          <div className="target-card">
            <div className="target-label">收件人</div>
            <Button
              type="button"
              variant="outline"
              className="target-pill"
              onClick={() => setTargetUser(null)}
              aria-label="更换收件人"
            >
              <UserCircle size={14} aria-hidden="true" />
              <span>{targetUser.nickname}</span>
              <span className="remove-mark" aria-hidden="true">×</span>
            </Button>
          </div>

          <Textarea
            className="message-input"
            placeholder={`给 ${targetUser.nickname} 发条消息吧...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={500}
            disabled={loading}
            aria-label="消息内容"
          />
          <div className="input-meta">
            <span className="char-count">{content.length}/500</span>
          </div>

          <Button
            type="button"
            className="send-btn"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            loading={loading}
          >
            <Send size={16} aria-hidden="true" />
            发送
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewMessagePage;
