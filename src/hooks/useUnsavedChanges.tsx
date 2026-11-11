import { useCallback, useEffect } from 'react';
import { useBlocker, type Location } from 'react-router-dom';
import { ConfirmDialog } from '../components/ui/confirmDialog';

export interface UnsavedChangesOptions {
  /** 弹层标题，默认「离开当前页面？」 */
  title?: string;
  /** 后果说明 */
  message?: string;
  /** 确认离开按钮文案 */
  confirmText?: string;
}

/**
 * 有未保存修改时的离开提醒：站内跳转走 `useBlocker` + 确认弹层，关标签页/刷新走 `beforeunload`。
 * 把返回的节点渲染在页面根节点即可。需要数据路由（createBrowserRouter）。
 *
 * 注意：调用方要把「提交中」排除掉，否则表单提交成功后的 `navigate` 会被拦成「未保存」，
 * 即 `useUnsavedChanges(isDirty && !loading)`。
 */
export function useUnsavedChanges(dirty: boolean, options: UnsavedChangesOptions = {}) {
  const {
    title = '离开当前页面？',
    message = '当前内容尚未保存，离开后本次编辑将丢失。',
    confirmText = '放弃并离开',
  } = options;

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: Location; nextLocation: Location }) =>
        dirty && currentLocation.pathname !== nextLocation.pathname,
      [dirty],
    ),
  );

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 部分浏览器仍要求设置 returnValue 才弹确认框
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const dialog = (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title={title}
      description={message}
      confirmText={confirmText}
      cancelText="继续编辑"
      tone="danger"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  );

  return dialog;
}
