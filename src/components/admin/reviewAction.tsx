import { useState } from 'react';
import type { ReviewContent } from '../../types/admin';
import { approveReview, rejectReview } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { adminUi } from '../../styles/adminUi';
import { Modal } from '../ui';
import { AdminButton } from './adminButton';
import { AdminLabel, AdminTextarea } from './adminField';

interface ReviewActionProps {
  content: ReviewContent;
  onSuccess: () => void;
}

export function ReviewAction({ content, onSuccess }: ReviewActionProps) {
  const [reason, setReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { loading, run } = useAsync();

  const handleApprove = () =>
    run(
      () =>
        approveReview({
          targetType: content.type,
          id: content.id,
        }),
      () => {
        showSuccessToast('审核通过');
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '审核失败'),
    );

  const handleReject = () => {
    if (!reason.trim()) {
      showErrorToast('请填写拒绝原因');
      return;
    }
    run(
      () =>
        rejectReview({
          targetType: content.type,
          id: content.id,
          reason: reason.trim(),
        }),
      () => {
        showSuccessToast('已拒绝');
        setShowRejectModal(false);
        setReason('');
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '操作失败'),
    );
  };

  return (
    <>
      <div className={adminUi.actions}>
        <AdminButton type="button" variant="ghost" disabled={loading} onClick={handleApprove} className="text-success hover:text-success/80">
          通过
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => setShowRejectModal(true)}
          className="text-error hover:text-error/80"
        >
          拒绝
        </AdminButton>
      </div>

      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝审核"
        footer={
          <div className="flex w-full items-center gap-3">
            <AdminButton type="button" variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
              取消
            </AdminButton>
            <AdminButton type="button" variant="danger" className="flex-1" disabled={loading} loading={loading} onClick={handleReject}>
              {loading ? '处理中…' : '确认拒绝'}
            </AdminButton>
          </div>
        }
      >
        <p className="text-sm text-brown-muted mb-4">请填写拒绝原因</p>
        <AdminLabel>拒绝原因</AdminLabel>
        <AdminTextarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="请输入拒绝原因，将通知用户"
          rows={4}
        />
      </Modal>
    </>
  );
}
