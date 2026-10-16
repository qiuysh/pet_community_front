import { useState } from 'react';
import { reviewApplication } from '../../api/adopt';
import { AdoptionApplicationInfo } from '../../types/adopt';
import { useToast } from '../toast';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Textarea } from '../ui/input';
import { Modal } from '../ui/modal';
import { Avatar } from '../ui/avatar';

interface AdoptionReviewProps {
  application: AdoptionApplicationInfo;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdoptionReview = ({ application, onClose, onSuccess }: AdoptionReviewProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleReview = (approve: boolean) => run(
    () => reviewApplication({
      applicationId: application.id,
      approve,
      reason: approve ? undefined : reason,
    }),
    () => onSuccess(),
    () => toast.error('审核操作失败'),
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="审核申请"
      size="md"
      footer={
        <>
          <Button variant="ghost" className="bg-muted" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="danger"
            disabled={loading}
            loading={loading && action === 'reject'}
            onClick={() => {
              if (action !== 'reject') {
                setAction('reject');
                return;
              }
              handleReview(false);
            }}
          >
            {loading && action === 'reject'
              ? '处理中...'
              : action === 'reject'
                ? '确认拒绝'
                : '拒绝'}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={loading}
            loading={loading && action !== 'reject'}
            onClick={() => handleReview(true)}
          >
            {loading ? '处理中...' : '通过'}
          </Button>
        </>
      }
    >
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={application.userAvatar || getDefaultUserAvatar()}
            name={application.userNickname}
            size="md"
          />
          <div>
            <div className="text-sm font-medium text-brown">{application.userNickname}</div>
            <div className="text-xs text-brown-muted">{application.createdAt}</div>
          </div>
        </div>

        <div className="bg-cream rounded-lg p-3">
          <div className="text-sm text-brown-secondary">{application.applicationInfo}</div>
        </div>
      </div>

      {action === 'reject' && (
        <div className="mb-2">
          <FieldLabel>拒绝原因</FieldLabel>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="请填写拒绝原因（可选）"
          />
        </div>
      )}
    </Modal>
  );
};
