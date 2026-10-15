import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * HeroUI Modal 受控状态（官方 hook 无子路径导出，本地薄封装以兼容按需引入）。
 * API 与 `@heroui/react` 的 useOverlayState 对齐。
 */
export interface UseOverlayStateProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseOverlayStateReturn {
  readonly isOpen: boolean;
  setOpen(isOpen: boolean): void;
  open(): void;
  close(): void;
  toggle(): void;
}

export function useOverlayState(props: UseOverlayStateProps = {}): UseOverlayStateReturn {
  const { defaultOpen = false, isOpen: controlledIsOpen, onOpenChange } = props;
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const setOpen = useCallback(
    (nextIsOpen: boolean) => {
      onOpenChangeRef.current?.(nextIsOpen);
      if (!isControlled) {
        setUncontrolledIsOpen(nextIsOpen);
      }
    },
    [isControlled],
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  return { close, isOpen, open, setOpen, toggle };
}
