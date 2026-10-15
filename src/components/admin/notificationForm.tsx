import { useState, useEffect } from 'react';
import type { SystemNotification, CreateNotificationRequest, UpdateNotificationRequest } from '../../types/admin';
import { createNotification, updateNotification } from '../../api/admin';
import { useToast } from '../toast';
import { AdminButton } from './adminButton';
import { AdminChip } from './adminChip';
import { AdminDateTime, AdminHint, AdminInput, AdminLabel, AdminSelect, AdminTextarea } from './adminField';
import { adminUi } from '../../styles/adminUi';

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

export function NotificationForm({ notification, onClose, onSuccess }: NotificationFormProps) {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<1 | 2 | 3>(1);
  const [targetType, setTargetType] = useState<0 | 1 | 2>(0);
  const [targetIds, setTargetIds] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!title.trim() || !content.trim()) {
      error('请填写完整信息');
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
    <div className={adminUi.overlay}>
      <div className="bg-white rounded-md shadow-hover w-full max-w-lg mx-4 animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-white shrink-0">
          <h2 className="text-lg font-semibold text-brown">
            {notification ? '编辑通知' : '发布通知'}
          </h2>
          <AdminButton variant="ghost" type="button" onClick={onClose} aria-label="关闭" className="text-brown-muted hover:text-brown transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </AdminButton>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto min-h-0 bg-white">
          <div>
            <AdminLabel required>通知标题</AdminLabel>
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入通知标题"
              maxLength={100}
            />
          </div>

          <div>
            <AdminLabel required>通知类型</AdminLabel>
            <AdminSelect value={type} onChange={(e) => setType(parseInt(e.target.value) as 1 | 2 | 3)}>
              {notificationTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </AdminSelect>
          </div>

          <div>
            <AdminLabel required>发送对象</AdminLabel>
            <AdminSelect
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
              <AdminLabel>目标用户ID（逗号分隔）</AdminLabel>
              <AdminInput
                value={targetIds}
                onChange={(e) => setTargetIds(e.target.value)}
                placeholder="如: 1,2,3 或 1 2 3"
              />
            </div>
          )}

          <div>
            <AdminLabel>定时推送时间</AdminLabel>
            <AdminDateTime aria-label="定时推送时间" value={publishAt} onChange={setPublishAt} />
            <AdminHint>留空则立即发送（保存为草稿）</AdminHint>
          </div>

          <div>
            <AdminLabel required>通知内容</AdminLabel>
            <AdminTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="请输入通知内容"
              maxLength={5000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <AdminButton type="button" variant="outline" onClick={onClose}>
              取消
            </AdminButton>
            <AdminButton type="submit" variant="secondary" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? '提交中...' : notification ? '保存修改' : '保存通知'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
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
    <div className={adminUi.overlay}>
      <div className={adminUi.modalDialog}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-brown">通知预览</h2>
          <AdminButton variant="ghost" type="button" onClick={onClose} aria-label="关闭" className="text-brown-muted hover:text-brown transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </AdminButton>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AdminChip tone={type === 3 ? 'warning' : 'secondary'}>{typeLabel}</AdminChip>
          </div>

          <h3 className="text-xl font-semibold text-brown mb-4">{title}</h3>

          <div className="bg-soft rounded-md p-4">
            <p className="text-brown-secondary whitespace-pre-wrap break-all">{content}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end">
          <AdminButton type="button" variant="outline" onClick={onClose}>
            关闭
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
