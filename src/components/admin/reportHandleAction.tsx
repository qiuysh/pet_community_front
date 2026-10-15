import { useState } from 'react';
import type { AdminReportInfo, ReportHandleAction as ReportAction } from '../../types/admin';
import { handleAdminReport } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { adminUi } from '../../styles/adminUi';
import { Modal } from '../ui';
import { AdminButton } from './adminButton';
import { AdminLabel, AdminTextarea } from './adminField';

interface ReportHandleActionProps {
  report: AdminReportInfo;
  onSuccess: () => void;
}

const ACTION_LABELS: Record<ReportAction, string> = {
  approve: '通过',
  warn: '警告',
  reject: '忽略',
};

export function ReportHandleAction({ report, onSuccess }: ReportHandleActionProps) {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<ReportAction>('approve');
  const [result, setResult] = useState('');
  const { loading, run } = useAsync();

  const openModal = (next: ReportAction) => {
    setAction(next);
    setResult('');
    setShowModal(true);
  };

  const handleSubmit = () => {
    run(
      () => handleAdminReport(report.id, { action, result: result.trim() || undefined }),
      () => {
        showSuccessToast(`已${ACTION_LABELS[action]}该举报`);
        setShowModal(false);
        setResult('');
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '处理失败'),
    );
  };

  return (
    <>
      <div className={adminUi.actions}>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => openModal('approve')}
          className="text-success hover:text-success/80"
        >
          通过
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => openModal('warn')}
          className="text-warning hover:text-warning/80"
        >
          警告
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => openModal('reject')}
          className="text-brown-secondary hover:text-brown"
        >
          忽略
        </AdminButton>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`处理举报 #${report.id}`}
        footer={
          <div className="flex w-full items-center gap-3">
            <AdminButton type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              取消
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={loading}
              loading={loading}
              onClick={handleSubmit}
            >
              {loading ? '处理中…' : `确认${ACTION_LABELS[action]}`}
            </AdminButton>
          </div>
        }
      >
        <p className="text-sm text-brown-muted mb-4">
          操作：{ACTION_LABELS[action]}
          {action === 'approve' && '（将下架相关内容）'}
          {action === 'warn' && '（将通知内容作者）'}
        </p>
        <div className="mb-4 p-3 bg-soft rounded-md text-sm text-brown-secondary">
          <div>
            类型：
            {report.targetType === 'post'
              ? '动态'
              : report.targetType === 'comment'
                ? '评论'
                : report.targetType}
          </div>
          <div className="mt-1">原因：{report.reason}</div>
        </div>
        <AdminLabel>处理说明（可选）</AdminLabel>
        <AdminTextarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="填写处理说明，将通知举报人"
          rows={3}
          maxLength={200}
        />
      </Modal>
    </>
  );
}
