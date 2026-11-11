import { ChevronLeft, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export interface ChatSearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onClose: () => void;
  onCompositionChange: (composing: boolean) => void;
}

/** 聊天头部内联搜索条 */
export function ChatSearchBar({
  keyword,
  onKeywordChange,
  onClose,
  onCompositionChange,
}: ChatSearchBarProps) {
  return (
    <div className="chat-search-bar">
      <Button
        type="button"
        variant="ghost"
        className="back-btn"
        onClick={onClose}
        aria-label="关闭搜索"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </Button>
      <Input
        className="chat-search-bar__input"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        onCompositionStart={() => onCompositionChange(true)}
        onCompositionEnd={() => onCompositionChange(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
        placeholder="搜索聊天记录"
        maxLength={50}
        autoFocus
        aria-label="搜索聊天记录"
      />
      <Button
        type="button"
        variant="ghost"
        className="chat-search-bar__cancel"
        onClick={onClose}
        aria-label="取消搜索"
      >
        <X size={20} aria-hidden="true" />
      </Button>
    </div>
  );
}
