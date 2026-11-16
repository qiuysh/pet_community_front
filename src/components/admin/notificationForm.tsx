import { useState, useEffect } from 'react';
import type { SystemNotification, CreateNotificationRequest, UpdateNotificationRequest } from '../../types/admin';
import { createNotification, updateNotification } from '../../api/admin';
import { useToast } from '../toast';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { FieldError, Modal } from '../ui';
import { AdminButton } from './adminButton';
import { AdminChip } from './adminChip';
import { AdminDateTime, AdminHint, AdminInput, AdminLabel, AdminSelect, AdminTextarea } from './adminField';

interface NotificationFormProps {
  notification?: SystemNotification | null;
  onClose: () => void;
  onSuccess: () => void;
}

const notificationTypes = [
  { value: 1, label: '系统通知' },
  { value: 2, label: '公告' },
  { value: 3, label: '维护通知' },
];

const targetTypes = [
  { value: 0, label: '全部用户' },
  { value: 1, label: '指定用户组' },
  { value: 2, label: '特定用户' },
];

const FORM_ID = 'notification-form';

export function NotificationForm({ notification, onClose, onSuccess }: NotificationFormProps) {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<1 | 2 | 3>(1);
  const [targetType, setTargetType] = useState<0 | 1 | 2>(0);
  const [targetIds, setTargetIds] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, showErrors, clearError, formRef } = useFormErrors(['title', 'content'] as const);

  useEffect(() => {
    if (notification) {
      setTitle(notification.title);
      setContent(notification.content);
      setType(notification.type as 1 | 2 | 3);
      setTargetType(notification.targetType as 0 | 1 | 2);
      if (notification.targetIds) {
        setTargetIds(notification.targetIds);
      }
      if (notification.publishAt) {
        const date = new Date(notification.publishAt);
        setPublishAt(date.toISOString().slice(0, 16));
      }
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors<'title' | 'content'> = {};
    if (!title.trim()) next.title = '请填写通知标题';
    if (!content.trim()) next.content = '请填写通知内容';
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      const targetIdsArray = targetIds
        .trim()
        .split(/[,，\s]+/)
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

      const data: CreateNotificationRequest | UpdateNotificationRequest = {
        title: title.trim(),
        content: content.trim(),
        type,
        targetType,
        targetIds: targetIdsArray.length > 0 ? targetIdsArray : undefined,
        publishAt: publishAt || undefined,
      };

      if (notification) {
        await updateNotification(notification.id, data);
        success('通知更新成功');
      } else {
        await createNotification(data as CreateNotificationRequest);
        success('通知创建成功');
      }
      onSuccess();
      onClose();
    } catch {
      error('操作失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={notification ? '编辑通知' : '发布通知'}
      tone="secondary"
      size="lg"
      footer={
        <div className="flex w-full justify-end gap-3">
          <AdminButton type="button" variant="outline" onClick={onClose}>
            取消
          </AdminButton>
          <AdminButton
            type="submit"
            form={FORM_ID}
            variant="secondary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? '提交中…' : notification ? '保存修改' : '保存通知'}
          </AdminButton>
        </div>
      }
    >
      <form id={FORM_ID} ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AdminLabel htmlFor="notification-title" required>
            通知标题
          </AdminLabel>
          <AdminInput
            id="notification-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            placeholder="请输入通知标题…"
            maxLength={100}
            autoComplete="off"
            invalid={!!errors.title}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'notification-title-error' : undefined}
          />
          <FieldError id="notification-title-error">{errors.title}</FieldError>
        </div>

        <div>
          <AdminLabel htmlFor="notification-type" required>
            通知类型
          </AdminLabel>
          <AdminSelect
            id="notification-type"
            name="type"
            value={type}
            onChange={(e) => setType(parseInt(e.target.value) as 1 | 2 | 3)}
          >
            {notificationTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <AdminLabel htmlFor="notification-target-type" required>
            发送对象
          </AdminLabel>
          <AdminSelect
            id="notification-target-type"
            name="targetType"
            value={targetType}
            onChange={(e) => setTargetType(parseInt(e.target.value) as 0 | 1 | 2)}
          >
            {targetTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AdminSelect>
        </div>

        {(targetType === 1 || targetType === 2) && (
          <div>
            <AdminLabel htmlFor="notification-target-ids">目标用户ID（逗号分隔）</AdminLabel>
            <AdminInput
              id="notification-target-ids"
              name="targetIds"
              value={targetIds}
              onChange={(e) => setTargetIds(e.target.value)}
              placeholder="如: 1,2,3 或 1 2 3…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div>
          <AdminLabel htmlFor="notification-publish-at">定时推送时间</AdminLabel>
          <AdminDateTime
            id="notification-publish-at"
            aria-label="定时推送时间"
            value={publishAt}
            onChange={setPublishAt}
          />
          <AdminHint>留空则立即发送（保存为草稿）</AdminHint>
        </div>

        <div>
          <AdminLabel htmlFor="notification-content" required>
            通知内容
          </AdminLabel>
          <AdminTextarea
            id="notification-content"
            name="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              clearError('content');
            }}
            rows={6}
            placeholder="请输入通知内容…"
            maxLength={5000}
            invalid={!!errors.content}
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'notification-content-error' : undefined}
          />
          <FieldError id="notification-content-error">{errors.content}</FieldError>
        </div>
      </form>
    </Modal>
  );
}

interface NotificationPreviewProps {
  title: string;
  content: string;
  type: number;
  onClose: () => void;
}

export function NotificationPreview({ title, content, type, onClose }: NotificationPreviewProps) {
  const typeLabel = notificationTypes.find((t) => t.value === type)?.label || '系统通知';

  return (
    <Modal
      open
      onClose={onClose}
      title="通知预览"
      tone="secondary"
      footer={
        <AdminButton type="button" variant="outline" onClick={onClose}>
          关闭
        </AdminButton>
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <AdminChip tone={type === 3 ? 'warning' : 'secondary'}>{typeLabel}</AdminChip>
      </div>

      <h3 className="page-content-title mb-4">{title}</h3>

      <div className="bg-soft rounded-md p-4">
        <p className="text-brown-secondary whitespace-pre-wrap break-all">{content}</p>
      </div>
    </Modal>
  );
}
