import { useRef } from 'react';
import type { ChangeEvent, KeyboardEvent, PointerEvent } from 'react';
import { ImagePlus, Mic, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/input';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { showErrorToast } from '../../utils/toastManager';

/** 私信图片大小上限（与后端 scene=message 一致） */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** 消息文本上限（与后端校验一致） */
const MAX_TEXT_LENGTH = 500;
/** 与后端 messageImageExts / accept 对齐 */
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export interface VoiceCompleteMeta {
  /** 是否因达到时长上限自动结束（真正发送成功后再提示） */
  autoStopped: boolean;
}

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSendText: () => void;
  /** 已通过本地校验的图片文件（交由上层预览确认） */
  onImageSelected: (file: File) => void;
  onVoiceComplete: (blob: Blob, duration: number, meta: VoiceCompleteMeta) => void;
  sending: boolean;
  disabled?: boolean;
}

/** 聊天输入区：图片选择 + 按住录音 + 文本发送 */
export function ChatComposer({
  value,
  onChange,
  onSendText,
  onImageSelected,
  onVoiceComplete,
  sending,
  disabled = false,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recorder = useVoiceRecorder({
    maxSeconds: 60,
    onComplete: (result, autoStopped) => {
      onVoiceComplete(result.blob, result.duration, { autoStopped });
    },
    onError: (message) => showErrorToast(message),
  });

  const busy = sending || disabled;
  const recording = recorder.recording || recorder.starting;

  const handlePickImage = () => {
    if (busy || recording) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 允许重复选择同一文件
    event.target.value = '';
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      showErrorToast('仅支持 jpg/png/gif/webp 图片');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showErrorToast('图片大小不能超过2MB');
      return;
    }
    onImageSelected(file);
  };

  const handleVoicePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    void recorder.start();
  };

  const handleVoicePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    recorder.stop();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!recording) onSendText();
    }
  };

  return (
    <div className="input-area">
      {recording ? (
        <div className="recording-hint" role="status">
          <span className="recording-dot" aria-hidden="true" />
          {recorder.starting ? '正在开启麦克风…' : `松开发送 · ${recorder.seconds}s / 60s`}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <Button
        type="button"
        variant="ghost"
        className="composer-icon-btn"
        aria-label="选择图片"
        onClick={handlePickImage}
        disabled={busy || recording}
      >
        <ImagePlus size={22} aria-hidden="true" />
      </Button>

      <Textarea
        className="message-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息…"
        rows={1}
        maxLength={MAX_TEXT_LENGTH}
        disabled={busy || recording}
        aria-label="输入消息"
      />

      <button
        type="button"
        className={`composer-icon-btn voice-btn${recorder.recording ? ' is-recording' : ''}`}
        aria-label={recorder.recording ? '录音中，松开结束' : '按住录音'}
        disabled={busy}
        onPointerDown={handleVoicePointerDown}
        onPointerUp={handleVoicePointerUp}
        onPointerCancel={() => recorder.cancel()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Mic size={22} aria-hidden="true" />
      </button>

      <Button
        type="button"
        variant={value.trim() ? 'primary' : 'ghost'}
        className={`send-btn ${value.trim() ? 'active' : ''}`}
        onClick={onSendText}
        disabled={busy || recording || !value.trim()}
        aria-label="发送"
      >
        <Send size={24} aria-hidden="true" />
      </Button>
    </div>
  );
}
