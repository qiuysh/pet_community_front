import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from 'react';
import { search } from '../../api/discovery';
import type { UserSearchResult } from '../../types/discovery';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { applyMention, getMentionTrigger } from '../../utils/mentionUtils';
import { useUserStore } from '../../stores/userStore';
import { Avatar } from '../ui/avatar';

export interface MentionTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** 选择建议后回调当前正文里已知的 userId 列表 */
  onAtUsersChange?: (userIds: number[]) => void;
}

const DEBOUNCE_MS = 280;
const MAX_SUGGESTIONS = 10;

/**
 * 带 @ 用户搜索建议的输入框（D4-01/02）。
 * 插入 `@昵称 `；后端 ParseAtUsers 按昵称解析通知。
 */
export function MentionTextarea({
  value,
  onChange,
  onAtUsersChange,
  className = '',
  id,
  ...rest
}: MentionTextareaProps) {
  const autoId = useId();
  const textareaId = id || autoId;
  const listboxId = `${textareaId}-mention-list`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selfId = useUserStore((s) => s.user?.id);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [triggerStart, setTriggerStart] = useState(0);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const knownUsers = useRef<Map<string, number>>(new Map());

  const emitAtUsers = useCallback(
    (text: string) => {
      if (!onAtUsersChange) return;
      const ids: number[] = [];
      const seen = new Set<number>();
      for (const [nickname, userId] of knownUsers.current) {
        if (!text.includes(`@${nickname}`) || seen.has(userId)) continue;
        seen.add(userId);
        ids.push(userId);
      }
      onAtUsersChange(ids);
    },
    [onAtUsersChange],
  );

  const syncTrigger = useCallback(
    (text: string, cursor: number) => {
      const trigger = getMentionTrigger(text, cursor);
      if (!trigger) {
        setOpen(false);
        setQuery('');
        return;
      }
      setTriggerStart(trigger.start);
      setQuery(trigger.query);
      setOpen(true);
      setActiveIndex(0);
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    // 全局搜索接口要求 keyword 非空；仅输入 @ 时提示继续输入
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void search(query)
        .then((res) => {
          if (cancelled) return;
          const users = (res.users || [])
            .filter((u) => u.id !== selfId)
            .slice(0, MAX_SUGGESTIONS);
          setSuggestions(users);
          setActiveIndex(0);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, selfId]);

  const pickUser = useCallback(
    (user: UserSearchResult) => {
      const trigger = getMentionTrigger(
        value,
        textareaRef.current?.selectionStart ?? value.length,
      );
      const start = trigger?.start ?? triggerStart;
      const currentQuery = trigger?.query ?? query;
      const { text, cursor } = applyMention(value, start, currentQuery, user.nickname);
      knownUsers.current.set(user.nickname, user.id);
      onChange(text);
      emitAtUsers(text);
      setOpen(false);
      setQuery('');
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(cursor, cursor);
      });
    },
    [emitAtUsers, onChange, query, triggerStart, value],
  );

  const handleChange = (next: string) => {
    onChange(next);
    const cursor = textareaRef.current?.selectionStart ?? next.length;
    syncTrigger(next, cursor);
    emitAtUsers(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const user = suggestions[activeIndex];
      if (user) pickUser(user);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="mention-textarea relative">
      <textarea
        {...rest}
        id={textareaId}
        ref={textareaRef}
        value={value}
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-activedescendant={
          open && suggestions[activeIndex] ? `${listboxId}-opt-${suggestions[activeIndex].id}` : undefined
        }
        role="combobox"
        className={[
          'w-full resize-none rounded-sm border border-border bg-white px-3 py-2 text-sm text-brown',
          'placeholder:text-brown-muted shadow-none',
          'focus:border-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onChange={(e) => handleChange(e.target.value)}
        onClick={() => {
          const el = textareaRef.current;
          if (el) syncTrigger(value, el.selectionStart);
        }}
        onKeyUp={() => {
          const el = textareaRef.current;
          if (el) syncTrigger(value, el.selectionStart);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="用户搜索建议"
          className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-auto rounded-sm border border-border-light bg-white py-1 shadow-hover"
        >
          {loading && suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-brown-muted">搜索中…</li>
          )}
          {!loading && suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-brown-muted">
              {query ? '未找到匹配用户' : '输入昵称搜索'}
            </li>
          )}
          {suggestions.map((user, index) => (
            <li
              key={user.id}
              id={`${listboxId}-opt-${user.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={[
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-brown',
                index === activeIndex ? 'bg-soft' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={(e) => {
                e.preventDefault();
                pickUser(user);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <Avatar
                src={user.avatar || getDefaultUserAvatar()}
                name={user.nickname}
                alt=""
                size="sm"
              />
              <span className="page-section-title truncate">{user.nickname}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
