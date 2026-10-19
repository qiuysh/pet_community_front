import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export interface ChatImagePreviewProps {
  open: boolean;
  src: string;
  /** 正在上传/发送 */
  sending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 图片发送前预览确认 */
export function ChatImagePreview({
  open,
  src,
  sending,
  onCancel,
  onConfirm,
}: ChatImagePreviewProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="发送图片"
      size="md"
      dismissable={!sending}
      footer={
        <div className="chat-image-preview__footer">
          <Button variant="ghost" onClick={onCancel} disabled={sending}>
            取消
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={sending} aria-label="确认图片消息">
            {sending ? <Spinner size="sm" /> : '发送'}
          </Button>
        </div>
      }
    >
      <div className="chat-image-preview__body">
        {src ? <img src={src} alt="待发送的图片" /> : null}
        <p className="chat-image-preview__tip">图片将以上述内容发送（≤2MB）</p>
      </div>
    </Modal>
  );
}
