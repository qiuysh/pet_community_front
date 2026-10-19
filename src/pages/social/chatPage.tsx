import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ChatComposer } from '../../components/chat/chatComposer';
import { ChatMessageItem } from '../../components/chat/chatMessageItem';
import { ChatSearchBar } from '../../components/chat/chatSearchBar';
import { ChatSearchResults } from '../../components/chat/chatSearchResults';
import { ChatImagePreview } from '../../components/chat/chatImagePreview';
import { ImageLightbox } from '../../components/chat/imageLightbox';
import { showInfoToast } from '../../utils/toastManager';
import './chatPage.scss';

interface ImagePreviewState {
  file: File;
  url: string;
}

interface LightboxState {
  src: string;
  alt: string;
}

const ChatPage: React.FC = () => {
  const { conversationId, targetUserId } = useParams<{
    conversationId: string;
    targetUserId: string;
  }>();
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem('user_id') || '0');

  const chat = useChat(parseInt(conversationId || '0'), parseInt(targetUserId || '0'));
  const search = useMessageSearch(parseInt(conversationId || '0'));
  const resetSearch = search.reset;

  const [searchOpen, setSearchOpen] = useState(false);
  const [locatingId, setLocatingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);
  const [previewSending, setPreviewSending] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const previewRef = useRef<ImagePreviewState | null>(null);
  previewRef.current = preview;

  // 会话切换时关闭搜索态，并释放预览 blob，避免泄漏 / 串会话
  useEffect(() => {
    setSearchOpen(false);
    resetSearch();
    setLightbox(null);
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current.url);
    }
    setPreview(null);
    setPreviewSending(false);
  }, [conversationId, resetSearch]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current.url);
      }
    };
  }, []);

  const openSearch = () => setSearchOpen(true);

  const closeSearch = () => {
    setSearchOpen(false);
    search.reset();
  };

  const handleSelectResult = async (messageId: number) => {
    setLocatingId(messageId);
    const ok = await chat.jumpToMessage(messageId);
    setLocatingId(null);
    if (ok) closeSearch();
  };

  const handleCancelPreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handleConfirmImage = async () => {
    if (!preview) return;
    const { file, url } = preview;
    setPreviewSending(true);
    await chat.sendImage(file);
    setPreviewSending(false);
    URL.revokeObjectURL(url);
    setPreview(null);
  };

  return (
    <div className="chat-page">
      {searchOpen ? (
        <ChatSearchBar
          keyword={search.keyword}
          onKeywordChange={search.setKeyword}
          onClose={closeSearch}
          onCompositionChange={search.setComposing}
        />
      ) : (
        <div className="chat-header">
          <Button
            type="button"
            variant="ghost"
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </Button>
          <Link to={`/profile/${targetUserId}`} className="user-info">
            <div className="user-avatar" />
            <span className="user-name">对方用户</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="back-btn"
            onClick={openSearch}
            aria-label="搜索消息"
          >
            <Search size={22} aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="chat-body">
        <div className="messages-container" ref={chat.messagesContainerRef}>
          {chat.loading && chat.messages.length === 0 ? (
            <div className="messages-list p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className={`h-12 max-w-[70%] ${i % 2 === 0 ? 'ml-auto' : ''}`} />
              ))}
            </div>
          ) : (
            <div className="messages-list">
              {chat.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isMine={msg.fromId === currentUserId}
                  highlighted={chat.highlightedMessageId === msg.id}
                  onPreviewImage={(src, alt) => setLightbox({ src, alt })}
                />
              ))}
              <div ref={chat.messagesEndRef} />
            </div>
          )}
        </div>

        {searchOpen ? (
          <ChatSearchResults
            keyword={search.keyword}
            status={search.status}
            results={search.results}
            total={search.total}
            currentUserId={currentUserId}
            loadingMore={search.loadingMore}
            hasMore={search.hasMore}
            error={search.error}
            locatingId={locatingId}
            onSelect={handleSelectResult}
            onLoadMore={search.loadMore}
            onRetry={search.retry}
          />
        ) : null}
      </div>

      <ChatComposer
        value={chat.inputValue}
        onChange={chat.setInputValue}
        onSendText={chat.sendMessage}
        onImageSelected={(file) => setPreview({ file, url: URL.createObjectURL(file) })}
        onVoiceComplete={(blob, duration, meta) => {
          void (async () => {
            const ok = await chat.sendVoice(blob, duration);
            if (ok && meta.autoStopped) {
              showInfoToast('已达到60秒上限，已自动发送');
            }
          })();
        }}
        sending={chat.sending}
      />

      <ChatImagePreview
        open={Boolean(preview)}
        src={preview?.url ?? ''}
        sending={previewSending}
        onCancel={handleCancelPreview}
        onConfirm={handleConfirmImage}
      />

      <ImageLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? ''}
        alt={lightbox?.alt}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
};

export default ChatPage;
