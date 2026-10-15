import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Smile, Send } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/input';
import './chatPage.scss';

const ChatPage: React.FC = () => {
  const { conversationId, targetUserId } = useParams<{
    conversationId: string;
    targetUserId: string;
  }>();
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem('user_id') || '0');

  const {
    messages,
    loading,
    inputValue,
    setInputValue,
    sendMessage,
    messagesEndRef,
  } = useChat(parseInt(conversationId || '0'), parseInt(targetUserId || '0'));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <Link to={`/profile/${targetUserId}`} className="user-info">
          <div className="user-avatar" />
          <span className="user-name">对方用户</span>
        </Link>
        <div className="placeholder" />
      </div>

      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="messages-list p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className={`h-12 max-w-[70%] ${i % 2 === 0 ? 'ml-auto' : ''}`} />
            ))}
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-item ${msg.fromId === currentUserId ? 'sent' : 'received'}`}
              >
                {msg.isRecalled ? (
                  <div className="recalled-message">消息已撤回</div>
                ) : (
                  <>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">{formatTime(msg.createdAt)}</div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <Button type="button" variant="ghost" className="emoji-btn" aria-label="表情">
          <Smile size={24} />
        </Button>
        <Textarea
          className="message-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息…"
          rows={1}
          aria-label="输入消息"
        />
        <Button
          type="button"
          variant={inputValue.trim() ? 'primary' : 'ghost'}
          className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          aria-label="发送"
        >
          <Send size={24} />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
