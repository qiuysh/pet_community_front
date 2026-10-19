import { useCallback, useEffect, useRef, useState } from 'react';
import { messageApi } from '../api/social';
import type { ChatMessage } from '../types/social';
import { showErrorToast } from '../utils/toastManager';

/** 单页消息条数 */
const PAGE_SIZE = 100;
/** 定位历史消息时最多回翻页数 */
const MAX_LOCATE_PAGES = 20;
/** 私信图片大小上限（与后端 scene=message 一致） */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** 定位高亮持续时间 */
const HIGHLIGHT_MS = 2500;

/** 临时消息 id（负数，避免与后端 id 冲突） */
let tempIdSeed = -1;

/** 展示顺序：时间升序 + id 升序；发送中的临时消息恒排末尾 */
function sortMessages(list: ChatMessage[]): ChatMessage[] {
  return [...list].sort((a, b) => {
    if (a.pending && !b.pending) return 1;
    if (!a.pending && b.pending) return -1;
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    if (ta !== tb) return ta - tb;
    return a.id - b.id;
  });
}

/** 语音 blob 的扩展名（后端按扩展名白名单校验） */
export function extFromMime(mime: string): string {
  const base = mime.split(';')[0].toLowerCase();
  if (base.includes('webm')) return 'webm';
  if (base.includes('ogg')) return 'ogg';
  if (base.includes('mp4')) return 'm4a';
  if (base.includes('aac')) return 'aac';
  if (base.includes('mpeg')) return 'mp3';
  if (base.includes('wav')) return 'wav';
  return 'webm';
}

export interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  /** 有消息正在发送/上传 */
  sending: boolean;

  inputValue: string;
  setInputValue: (value: string) => void;

  sendMessage: () => Promise<void>;
  sendImage: (file: File) => Promise<boolean>;
  sendVoice: (blob: Blob, duration: number) => Promise<boolean>;

  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;

  /** 搜索定位后高亮的消息 id */
  highlightedMessageId: number | null;
  /** 正在回翻历史定位 */
  locating: boolean;
  jumpToMessage: (messageId: number) => Promise<boolean>;
}

/**
 * 单聊页 hook
 *
 * 管理:
 * - 进入会话时 markAsRead + 拉取最新消息（按时间升序展示）
 * - 文本/图片/语音发送（乐观消息 + 失败回滚）
 * - 搜索结果的滚动定位
 */
export function useChat(conversationId: number, targetUserId: number): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 后端报告的消息总数，用于判断定位需要回翻多少页 */
  const totalRef = useRef(0);
  /** 当前会话；用于丢弃切会话后的过期发送回调 */
  const conversationIdRef = useRef(conversationId);
  /** 每次切会话递增，使进行中的发送不再 settle / 改 sending */
  const sendEpochRef = useRef(0);

  const currentUserId = Number(localStorage.getItem('user_id') || 0);

  const revokeObjectUrl = useCallback((url: string) => {
    if (!objectUrlsRef.current.has(url)) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  }, []);

  const revokeAllObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  /** 远端 URL 挂载后再释放 blob，避免 settle 当帧裂图/无声 */
  const revokeObjectUrlAfterPaint = useCallback(
    (url: string) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => revokeObjectUrl(url));
      });
    },
    [revokeObjectUrl],
  );

  const scrollToBottom = useCallback((smooth = false) => {
    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    });
  }, []);

  // 会话切换：作废进行中的发送，重置并拉取最新一页
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    conversationIdRef.current = conversationId;
    sendEpochRef.current += 1;
    setSending(false);
    setInputValue('');
    revokeAllObjectUrls();

    setMessages([]);
    setLoading(true);
    setHighlightedMessageId(null);

    void (async () => {
      try {
        messageApi.markAsRead(conversationId).catch((error) => {
          console.error('标记已读失败', error);
        });
        const res = await messageApi.getMessages(conversationId, { page: 1, pageSize: PAGE_SIZE });
        if (cancelled) return;
        totalRef.current = res?.total ?? 0;
        setMessages(sortMessages(res?.list ?? []));
        scrollToBottom(false);
      } catch (error) {
        if (!cancelled) console.error('获取消息失败', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, revokeAllObjectUrls, scrollToBottom]);

  // 卸载时释放所有本地预览地址
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  /** 用后端消息替换临时消息；real 为空表示发送失败，直接移除 */
  const settlePending = useCallback((tempId: number, real?: ChatMessage) => {
    setMessages((prev) =>
      real
        ? sortMessages(prev.map((item) => (item.id === tempId ? real : item)))
        : prev.filter((item) => item.id !== tempId),
    );
  }, []);

  /** 发送回调是否仍属于当前会话 */
  const isSendCurrent = useCallback((epoch: number, ownedConversationId: number) => {
    return sendEpochRef.current === epoch && conversationIdRef.current === ownedConversationId;
  }, []);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !targetUserId || sending) return;

    const epoch = sendEpochRef.current;
    const ownedConversationId = conversationIdRef.current;
    const tempId = tempIdSeed--;
    const temp: ChatMessage = {
      id: tempId,
      fromId: currentUserId,
      toId: targetUserId,
      content: text,
      type: 'text',
      duration: 0,
      status: 0,
      isRecalled: 0,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => sortMessages([...prev, temp]));
    setInputValue('');
    setSending(true);
    try {
      const saved = await messageApi.sendMessage({ toId: targetUserId, content: text, type: 'text' });
      if (!isSendCurrent(epoch, ownedConversationId)) return;
      settlePending(tempId, saved);
      scrollToBottom(true);
    } catch (error) {
      console.error('发送消息失败', error);
      if (!isSendCurrent(epoch, ownedConversationId)) return;
      settlePending(tempId);
      setInputValue(text);
      showErrorToast('发送失败，请重试');
    } finally {
      if (isSendCurrent(epoch, ownedConversationId)) setSending(false);
    }
  }, [
    currentUserId,
    inputValue,
    isSendCurrent,
    scrollToBottom,
    sending,
    settlePending,
    targetUserId,
  ]);

  const sendImage = useCallback(
    async (file: File) => {
      if (!targetUserId || sending) return false;
      if (file.size > MAX_IMAGE_BYTES) {
        showErrorToast('图片大小不能超过2MB');
        return false;
      }

      const epoch = sendEpochRef.current;
      const ownedConversationId = conversationIdRef.current;
      const localUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(localUrl);
      const tempId = tempIdSeed--;
      const temp: ChatMessage = {
        id: tempId,
        fromId: currentUserId,
        toId: targetUserId,
        content: '[图片]',
        type: 'image',
        duration: 0,
        mediaUrl: localUrl,
        localUrl,
        status: 0,
        isRecalled: 0,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => sortMessages([...prev, temp]));
      setSending(true);
      try {
        const uploaded = await messageApi.uploadMessageImage(file);
        const saved = await messageApi.sendMessage({
          toId: targetUserId,
          type: 'image',
          mediaUrl: uploaded.url,
        });
        if (!isSendCurrent(epoch, ownedConversationId)) {
          revokeObjectUrl(localUrl);
          return false;
        }
        settlePending(tempId, saved);
        scrollToBottom(true);
        revokeObjectUrlAfterPaint(localUrl);
        return true;
      } catch (error) {
        console.error('发送图片失败', error);
        if (isSendCurrent(epoch, ownedConversationId)) {
          settlePending(tempId);
          showErrorToast('图片发送失败，请重试');
        }
        revokeObjectUrl(localUrl);
        return false;
      } finally {
        if (isSendCurrent(epoch, ownedConversationId)) setSending(false);
      }
    },
    [
      currentUserId,
      isSendCurrent,
      revokeObjectUrl,
      revokeObjectUrlAfterPaint,
      scrollToBottom,
      sending,
      settlePending,
      targetUserId,
    ],
  );

  const sendVoice = useCallback(
    async (blob: Blob, duration: number) => {
      if (!targetUserId || sending || blob.size === 0) return false;

      const epoch = sendEpochRef.current;
      const ownedConversationId = conversationIdRef.current;
      const mimeType = blob.type || 'audio/webm';
      const ext = extFromMime(mimeType);
      const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });
      const localUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.add(localUrl);

      const tempId = tempIdSeed--;
      const temp: ChatMessage = {
        id: tempId,
        fromId: currentUserId,
        toId: targetUserId,
        content: '[语音]',
        type: 'voice',
        duration,
        mediaUrl: localUrl,
        localUrl,
        status: 0,
        isRecalled: 0,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => sortMessages([...prev, temp]));
      setSending(true);
      try {
        const uploaded = await messageApi.uploadMessageVoice(file);
        const saved = await messageApi.sendMessage({
          toId: targetUserId,
          type: 'voice',
          mediaUrl: uploaded.url,
          duration,
        });
        if (!isSendCurrent(epoch, ownedConversationId)) {
          revokeObjectUrl(localUrl);
          return false;
        }
        settlePending(tempId, saved);
        scrollToBottom(true);
        revokeObjectUrlAfterPaint(localUrl);
        return true;
      } catch (error) {
        console.error('发送语音失败', error);
        if (isSendCurrent(epoch, ownedConversationId)) {
          settlePending(tempId);
          showErrorToast('语音发送失败，请重试');
        }
        revokeObjectUrl(localUrl);
        return false;
      } finally {
        if (isSendCurrent(epoch, ownedConversationId)) setSending(false);
      }
    },
    [
      currentUserId,
      isSendCurrent,
      revokeObjectUrl,
      revokeObjectUrlAfterPaint,
      scrollToBottom,
      sending,
      settlePending,
      targetUserId,
    ],
  );

  const jumpToMessage = useCallback(
    async (messageId: number) => {
      if (!conversationId || locating) return false;
      setLocating(true);
      try {
        let target = messages.find((item) => item.id === messageId);
        if (!target) {
          const merged = new Map<number, ChatMessage>(messages.map((item) => [item.id, item]));
          const totalPages = Math.min(
            MAX_LOCATE_PAGES,
            Math.max(1, Math.ceil((totalRef.current || PAGE_SIZE) / PAGE_SIZE)),
          );
          for (let page = 2; page <= totalPages; page += 1) {
            const res = await messageApi.getMessages(conversationId, { page, pageSize: PAGE_SIZE });
            (res?.list ?? []).forEach((item) => merged.set(item.id, item));
            target = merged.get(messageId);
            if (target) break;
          }
          setMessages(sortMessages([...merged.values()]));
        }

        if (!target) {
          showErrorToast('该消息较早，暂时无法定位');
          return false;
        }

        // 等 React 提交 DOM 后再滚动；必要时再等一帧
        const findElement = () =>
          messagesContainerRef.current?.querySelector<HTMLElement>(
            `[data-message-id="${messageId}"]`,
          ) ?? null;

        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
        });
        let element = findElement();
        if (!element) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, 50);
          });
          element = findElement();
        }
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setHighlightedMessageId(messageId);
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedMessageId(null), HIGHLIGHT_MS);
        return true;
      } catch (error) {
        console.error('定位消息失败', error);
        return false;
      } finally {
        setLocating(false);
      }
    },
    [conversationId, locating, messages],
  );

  return {
    messages,
    loading,
    sending,
    inputValue,
    setInputValue,
    sendMessage,
    sendImage,
    sendVoice,
    messagesEndRef,
    messagesContainerRef,
    highlightedMessageId,
    locating,
    jumpToMessage,
  };
}
