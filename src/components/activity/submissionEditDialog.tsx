import { useState } from 'react';
import { updateSubmission } from '../../api/activity';
import type { SubmissionInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../toast';
import { Button } from '../ui/button';
import { FieldLabel, Input, Textarea } from '../ui/input';
import { Modal } from '../ui/modal';

interface SubmissionEditDialogProps {
  submission: SubmissionInfo;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** 参赛作品编辑：仅允许改标题与描述（图片/视频重传走投稿流程，避免绕过审核） */
export const SubmissionEditDialog = ({
  submission,
  open,
  onClose,
  onSuccess,
}: SubmissionEditDialogProps) => {
  const toast = useToast();
  const [title, setTitle] = useState(submission.title);
  const [description, setDescription] = useState(submission.description ?? '');
  const { loading, run } = useAsync();

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.warning('请填写作品标题');
      return;
    }
    run(
      () => updateSubmission(submission.id, { title: trimmedTitle, description: description.trim() }),
      () => {
        toast.success('作品已更新');
        onSuccess();
        onClose();
      },
      (err) => toast.error((err as Error).message || '更新作品失败'),
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="编辑作品"
      footer={
        <div className="flex w-full gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button className="flex-1" loading={loading} disabled={loading} onClick={handleSubmit}>
            保存
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="submission-title">作品标题</FieldLabel>
          <Input
            id="submission-title"
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给作品起个名字"
          />
        </div>
        <div>
          <FieldLabel htmlFor="submission-description">作品描述</FieldLabel>
          <Textarea
            id="submission-description"
            value={description}
            rows={4}
            maxLength={300}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="介绍一下你的作品"
          />
        </div>
        <p className="text-xs text-brown-muted">图片与视频需撤回后重新投稿，不支持在此修改。</p>
      </div>
    </Modal>
  );
};
