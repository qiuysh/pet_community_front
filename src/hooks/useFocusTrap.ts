import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * 弹层焦点管理：打开时聚焦容器内首个可聚焦元素，Tab/Shift+Tab 在容器内循环，
 * 关闭时把焦点还给打开前的元素。用于不走 `ui/modal`（React Aria）的自绘弹层。
 *
 * 用法：`const ref = useFocusTrap<HTMLDivElement>(open);` 再 `<div ref={ref} tabIndex={-1}>`。
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // 不按 offsetParent 过滤：position: fixed 容器内元素的 offsetParent 也是 null，
    // 会把整屏弹层里的控件全过滤掉（jsdom 下同样恒为 null）。
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const first = getFocusable()[0];
    (first ?? container).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return ref;
}
