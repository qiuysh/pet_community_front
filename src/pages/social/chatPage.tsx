import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useConfirm } from '../../hooks/useConfirm';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ChatComposer } from '../../components/chat/chatComposer';
import { ChatMessageItem } from '../../components/chat/chatMessageItem';
import { ChatSearchBar } from '../../components/chat/chatSearchBar';
import { ChatSearchResults } from '../../components/chat/chatSearchResults';
import { ChatImagePreview } from '../../components/chat/chatImagePreview';
import { ImageLightbox } from '../../components/chat/imageLightbox';
import { getPublicProfile } from '../../api/user';
import { messageApi } from '../../api/social';
import type { ChatMessage } from '../../types/social';
import { getUserAvatar } from '../../utils/avatarUtils';
import { showInfoToast, showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { useUserStore } from '../../stores/userStore';
import './chatPage.scss';

interface ImagePreviewState {
  file: File;
  url: string;
}

interface LightboxState {
  src: string;
  alt: string;
}

/** 撤回窗口：与后端一致，2 分钟 */
const RECALL_WINDOW_MS = 2 * 60 * 1000;

/** 仅自己发的、未撤回、非乐观发送中、且 2 分钟内的消息允许撤回 */
function canRecallMessage(message: ChatMessage): boolean {
  if (message.isRecalled) return false;
  if (message.pending) return false;
  const sentAt = new Date(message.createdAt).getTime();
  if (Number.isNaN(sentAt)) return false;
  return Date.now() - sentAt <= RECALL_WINDOW_MS;
}

const ChatPage: React.FC = () => {
  const { conversationId, targetUserId } = useParams<{
    conversationId: string;
    targetUserId: string;
  }>();
  // 当前用户 ID 以登录态 store 为准（localStorage 从未写入 user_id，读它会恒为 0）
  const { user: currentUser } = useUserStore();
  const currentUserId = currentUser?.id ?? 0;
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();
  const peerUserId = parseInt(targetUserId || '0');

  const chat = useChat(parseInt(conversationId || '0'), peerUserId);
  // 实时私信：对方发来的消息直接追加到当前会话（按 id 去重）
  useWebSocket(chat.receiveMessage);
  const search = useMessageSearch(parseInt(conversationId || '0'));
  const resetSearch = search.reset;

  const [peer, setPeer] = useState<{ nickname: string; avatar: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locatingId, setLocatingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);
  const [previewSending, setPreviewSending] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const previewRef = useRef<ImagePreviewState | null>(null);
  previewRef.current = preview;

  // 只有「进入会话之后新到达」的消息才播入场动画，历史消息整屏不动
  const knownMessageIdsRef = useRef<Set<number> | null>(null);
  const [newMessageIds, setNewMessageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const ids = new Set(chat.messages.map((msg) => msg.id));
    const known = knownMessageIdsRef.current;
    knownMessageIdsRef.current = ids;
    if (known === null) return; // 首次拉到的历史消息：只登记
    const added = [...ids].filter((id) => !known.has(id));
    if (added.length > 0) setNewMessageIds(new Set(added));
  }, [chat.messages]);

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
    // 只重置登记表，不重建 state（本 effect 依赖的 resetSearch 每次渲染都是新引用，
    // 在这里 setState 一个新 Set 会造成无限重渲染）
    knownMessageIdsRef.current = null;
  }, [conversationId, resetSearch]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current.url);
      }
    };
  }, []);

  // 拉取对方公开资料，用于会话头部头像与昵称；失败时保留占位，不阻塞聊天
  useEffect(() => {
    let cancelled = false;
    if (!peerUserId) {
      setPeer(null);
      return;
    }
    getPublicProfile(peerUserId)
      .then((profile) => {
        if (!cancelled) {
          setPeer({ nickname: profile.nickname, avatar: profile.avatar });
        }
      })
      .catch(() => {
        if (!cancelled) setPeer(null);
      });
    return () => {
      cancelled = true;
    };
  }, [peerUserId]);

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
          <BackButton />
          <Link to={`/profile/${peerUserId}`} className="user-info">
            <img className="user-avatar" src={getUserAvatar(peer?.avatar)} alt="" decoding="async" />
            <span className="user-name">{peer?.nickname || '宠友'}</span>
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
          <Button
            type="button"
            variant="ghost"
            className="back-btn"
            aria-label="删除会话"
            onClick={async () => {
              const ok = await confirm({
                title: '删除会话',
                description: '删除后该会话将从你的列表中移除，对方不受影响，历史消息不可恢复。',
                confirmText: '删除',
                tone: 'danger',
              });
              if (!ok || !conversationId) return;
              try {
                await messageApi.deleteConversation(Number(conversationId));
                showSuccessToast('会话已删除');
                navigate('/messages');
              } catch (error) {
                showErrorToast((error as Error).message || '删除会话失败');
              }
            }}
          >
            <Trash2 size={20} aria-hidden="true" />
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
                  canRecall={msg.fromId === currentUserId && canRecallMessage(msg)}
                  onRecall={chat.recallMessage}
                  isNew={newMessageIds.has(msg.id)}
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

      {confirmDialog}
    </div>
  );
};

export default ChatPage;
