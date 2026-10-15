import { useState } from 'react';
import { createApplication } from '../../api/adopt';
import { AdoptionApplicationInfo } from '../../types/adopt';
import { useToast } from '../toast';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Textarea } from '../ui/input';
import { Modal } from '../ui/modal';

interface AdoptionApplyFormProps {
  adoptionId: number;
  onClose: () => void;
  onSuccess: (application: AdoptionApplicationInfo) => void;
}

export const AdoptionApplyForm = ({ adoptionId, onClose, onSuccess }: AdoptionApplyFormProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [applicationInfo, setApplicationInfo] = useState('');

  const handleSubmit = () => {
    if (!applicationInfo.trim()) {
      toast.error('请填写申请理由');
      return;
    }

    run(
      () => createApplication({
        adoptionId,
        applicationInfo: applicationInfo.trim(),
      }),
      (res) => onSuccess(res),
      () => toast.error('申请提交失败'),
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="申请领养"
      size="md"
      footer={
        <>
          <Button variant="ghost" className="flex-1 bg-muted" onClick={onClose}>
            取消
          </Button>
          <Button className="flex-1" disabled={loading} loading={loading} onClick={handleSubmit}>
            {loading ? '提交中...' : '提交申请'}
          </Button>
        </>
      }
    >
      <div className="mb-4">
        <FieldLabel required>申请理由</FieldLabel>
        <Textarea
          value={applicationInfo}
          onChange={(e) => setApplicationInfo(e.target.value)}
          rows={6}
          placeholder="请详细说明您的养宠经验、居住条件、为什么想领养这只宠物等"
        />
        <div className="mt-2 text-xs text-brown-muted">
          建议包含：养宠经验、居住环境、家庭成员、时间安排等信息
        </div>
      </div>

      <div className="bg-warning/10 rounded-md p-3">
        <div className="text-sm text-warning">
          <div className="font-medium mb-1">温馨提示：</div>
          <div>1. 领养前请确保有稳定住所和时间</div>
          <div>2. 领养后需签署领养协议</div>
          <div>3. 部分领养可能需要定期回访</div>
        </div>
      </div>
    </Modal>
  );
};
