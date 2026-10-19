import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import type { ChatMessage, MessageSearchStatus } from '../../types/social';
import { formatChatTime } from '../../utils/format';
import { buildSnippet, splitHighlight } from '../../utils/highlightMatches';

export interface ChatSearchResultsProps {
  keyword: string;
  status: MessageSearchStatus;
  results: ChatMessage[];
  total: number;
  currentUserId: number;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  locatingId: number | null;
  onSelect: (messageId: number) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

/** 搜索结果浮层（覆盖消息区，不遮挡输入区） */
export function ChatSearchResults({
  keyword,
  status,
  results,
  total,
  currentUserId,
  loadingMore,
  hasMore,
  error,
  locatingId,
  onSelect,
  onLoadMore,
  onRetry,
}: ChatSearchResultsProps) {
  if (status === 'idle') return null;

  return (
    <div className="chat-search-results" role="dialog" aria-label="消息搜索结果">
      {(status === 'debouncing' || status === 'loading') && (
        <div className="chat-search-results__skeletons">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="chat-search-results__state">
          <p>{error || '搜索失败，请稍后重试'}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            重试
          </Button>
        </div>
      )}

      {status === 'empty' && (
        <div className="chat-search-results__state">
          <p>没有找到相关消息</p>
        </div>
      )}

      {(status === 'success' || (status === 'loading' && results.length > 0)) && (
        <>
          <div className="chat-search-results__head">{`共 ${total} 条`}</div>
          <ul className="chat-search-results__list">
            {results.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  className="search-result-item"
                  onClick={() => onSelect(message.id)}
                  disabled={locatingId === message.id}
                >
                  <span className="search-result-item__meta">
                    <span className="search-result-item__from">
                      {message.fromId === currentUserId ? '我' : '对方'}
                    </span>
                    <span className="search-result-item__time">{formatChatTime(message.createdAt)}</span>
                    {locatingId === message.id ? <Spinner size="sm" /> : null}
                  </span>
                  <span className="search-result-item__text">
                    {splitHighlight(buildSnippet(message.content, keyword), keyword).map(
                      (segment, index) =>
                        segment.match ? (
                          <mark key={index} className="search-highlight">
                            {segment.text}
                          </mark>
                        ) : (
                          <span key={index}>{segment.text}</span>
                        ),
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {hasMore ? (
            <div className="chat-search-results__more">
              <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? '加载中…' : '加载更多'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
