import type { ReactNode } from 'react';
import { Button } from './button';
import { Modal } from './modal';

export type ConfirmDialogTone = 'danger' | 'primary';

export interface ConfirmDialogProps {
  /** 是否展示 */
  open: boolean;
  /** 标题，建议为动词短语，如「删除这张照片？」 */
  title: string;
  /** 后果说明：说清不可逆点与影响范围 */
  description?: ReactNode;
  /** 确认按钮文案，默认「确认」 */
  confirmText?: string;
  /** 取消按钮文案，默认「取消」 */
  cancelText?: string;
  /** 确认按钮语气，破坏性操作用 danger */
  tone?: ConfirmDialogTone;
  /** 确认操作进行中：两个按钮都禁用，确认按钮显示 pending */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const confirmVariant = {
  danger: 'danger',
  primary: 'primary',
} as const;

/**
 * 破坏性操作二次确认弹层。
 * 取消按钮排在前面，弹层打开时默认焦点落在取消上，避免误触确认。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" className="bg-muted" disabled={loading} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant[tone]}
            loading={loading}
            disabled={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {description ? (
        <p className="text-sm leading-relaxed text-brown-secondary">{description}</p>
      ) : null}
    </Modal>
  );
}
