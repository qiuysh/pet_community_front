import type { ChatMessage } from '../../types/social';
import { formatChatTime } from '../../utils/format';
import { Spinner } from '../ui/spinner';
import { VoiceMessageBubble } from './voiceMessageBubble';

export interface ChatMessageItemProps {
  message: ChatMessage;
  isMine: boolean;
  highlighted?: boolean;
  onPreviewImage: (src: string, alt: string) => void;
}

/** 单条消息：文本 / 图片 / 语音 / 已撤回 */
export function ChatMessageItem({
  message,
  isMine,
  highlighted = false,
  onPreviewImage,
}: ChatMessageItemProps) {
  const mediaSrc = message.mediaUrl || message.localUrl || '';
  const classNames = [
    'message-item',
    isMine ? 'sent' : 'received',
    highlighted ? 'highlighted' : '',
    message.pending ? 'pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} data-message-id={message.id}>
      {message.isRecalled ? (
        <div className="recalled-message">消息已撤回</div>
      ) : (
        <>
          {message.type === 'image' && mediaSrc ? (
            <button
              type="button"
              className="image-bubble"
              onClick={() => onPreviewImage(mediaSrc, '图片消息')}
              aria-label="查看大图"
            >
              <img src={mediaSrc} alt="图片消息" loading="lazy" />
              {message.pending ? (
                <span className="bubble-pending" aria-hidden="true">
                  <Spinner size="sm" />
                </span>
              ) : null}
            </button>
          ) : message.type === 'voice' && mediaSrc ? (
            <VoiceMessageBubble
              src={mediaSrc}
              duration={message.duration ?? 1}
              isMine={isMine}
              pending={message.pending}
            />
          ) : (
            <div className="message-content">{message.content}</div>
          )}
          <div className="message-time">{formatChatTime(message.createdAt)}</div>
        </>
      )}
    </div>
  );
}
