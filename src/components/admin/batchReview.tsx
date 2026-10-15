import { useState } from 'react';
import type { ReviewContent } from '../../types/admin';
import { batchReview } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { Modal } from '../ui';
import { AdminButton } from './adminButton';
import { AdminFilterRadio } from './adminFilterRadio';
import { AdminLabel, AdminTextarea } from './adminField';

interface BatchReviewProps {
  selectedItems: ReviewContent[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function BatchReview({ selectedItems, onSuccess, onCancel }: BatchReviewProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const { loading, run } = useAsync();

  const handleSubmit = () => {
    if (action === 'reject' && !reason.trim()) {
      showErrorToast('请填写拒绝原因');
      return;
    }

    const type = selectedItems[0]?.type;
    const ids = selectedItems.map((item) => item.id);

    run(
      () =>
        batchReview({
          targetType: type || 'post',
          ids,
          status: action === 'approve' ? 1 : 2,
          reason: action === 'reject' ? reason.trim() : undefined,
        }),
      () => {
        showSuccessToast(`已${action === 'approve' ? '通过' : '拒绝'} ${ids.length} 条记录`);
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '批量操作失败'),
    );
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title="批量审核"
      footer={
        <div className="flex w-full items-center gap-3">
          <AdminButton type="button" variant="outline" className="flex-1" onClick={onCancel}>
            取消
          </AdminButton>
          <AdminButton
            type="button"
            variant={action === 'reject' ? 'danger' : 'secondary'}
            className="flex-1"
            disabled={loading}
            loading={loading}
            onClick={handleSubmit}
          >
            {loading ? '处理中…' : `确认${action === 'approve' ? '通过' : '拒绝'}`}
          </AdminButton>
        </div>
      }
    >
      <p className="text-sm text-brown-muted mb-4">已选择 {selectedItems.length} 条记录</p>
      <div className="mb-4">
        <AdminLabel>审核操作</AdminLabel>
        <AdminFilterRadio
          className="mt-2"
          aria-label="批量审核操作"
          items={[
            { key: 'approve', label: '全部通过' },
            { key: 'reject', label: '全部拒绝' },
          ]}
          value={action}
          onChange={(key) => setAction(key as 'approve' | 'reject')}
        />
      </div>

      {action === 'reject' && (
        <div className="mb-2">
          <AdminLabel>拒绝原因</AdminLabel>
          <AdminTextarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请输入拒绝原因，将统一通知所有用户"
            rows={3}
          />
        </div>
      )}
    </Modal>
  );
}
