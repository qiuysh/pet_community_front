import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ui/confirmDialog';
import type { ConfirmDialogProps } from '../components/ui/confirmDialog';

export type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel' | 'loading'>;

/**
 * 破坏性操作二次确认：`const ok = await confirm({ title, description })`。
 * 把返回的 `confirmDialog` 渲染在页面任意位置即可（建议放根节点）。
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(next);
      setOpen(true);
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setOpen(false);
    // 弹层关闭后把焦点还给触发元素，避免焦点掉回 body
    const target = restoreFocusRef.current;
    restoreFocusRef.current = null;
    requestAnimationFrame(() => {
      if (target && document.contains(target)) target.focus();
    });
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={open}
      title={options?.title ?? ''}
      description={options?.description}
      confirmText={options?.confirmText}
      cancelText={options?.cancelText}
      tone={options?.tone}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, confirmDialog };
}
