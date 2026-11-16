import { useState, useEffect } from 'react';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/admin';
import { createAnnouncement, updateAnnouncement } from '../../api/admin';
import { showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { FieldError, Modal } from '../ui';
import { AdminButton } from './adminButton';
import { AdminDateTime, AdminInput, AdminLabel, AdminSelect, AdminTextarea } from './adminField';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
}

const announcementTypes = [
  { value: 1, label: '系统公告' },
  { value: 2, label: '活动公告' },
  { value: 3, label: '维护公告' },
];

const FORM_ID = 'announcement-form';

export function AnnouncementForm({ announcement, onClose, onSuccess }: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState(1);
  const [sortOrder, setSortOrder] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, showErrors, clearError, formRef } = useFormErrors(['title', 'content'] as const);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setType(announcement.type);
      setSortOrder(announcement.sortOrder);
      if (announcement.startAt) {
        const date = new Date(announcement.startAt);
        setStartAt(date.toISOString().slice(0, 16));
      }
      if (announcement.endAt) {
        const date = new Date(announcement.endAt);
        setEndAt(date.toISOString().slice(0, 16));
      }
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors<'title' | 'content'> = {};
    if (!title.trim()) next.title = '请填写公告标题';
    if (!content.trim()) next.content = '请填写公告内容';
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      const data: CreateAnnouncementRequest | UpdateAnnouncementRequest = {
        title: title.trim(),
        content: content.trim(),
        type,
        sortOrder,
        startAt: startAt || undefined,
        endAt: endAt || undefined,
      };

      if (announcement) {
        await updateAnnouncement(announcement.id, data);
        showSuccessToast('公告更新成功');
      } else {
        await createAnnouncement(data as CreateAnnouncementRequest);
        showSuccessToast('公告创建成功');
      }
      onSuccess();
      onClose();
    } catch {
      showErrorToast('操作失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={announcement ? '编辑公告' : '发布公告'}
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
            {isSubmitting ? '提交中…' : announcement ? '保存修改' : '发布公告'}
          </AdminButton>
        </div>
      }
    >
      <form id={FORM_ID} ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AdminLabel htmlFor="announcement-title" required>
            公告标题
          </AdminLabel>
          <AdminInput
            id="announcement-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            placeholder="请输入公告标题…"
            maxLength={200}
            autoComplete="off"
            invalid={!!errors.title}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'announcement-title-error' : undefined}
          />
          <FieldError id="announcement-title-error">{errors.title}</FieldError>
        </div>

        <div>
          <AdminLabel htmlFor="announcement-type">公告类型</AdminLabel>
          <AdminSelect
            id="announcement-type"
            name="type"
            aria-label="公告类型"
            value={type}
            onChange={(e) => setType(parseInt(e.target.value))}
          >
            {announcementTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <AdminLabel htmlFor="announcement-sort">排序权重</AdminLabel>
          <AdminInput
            id="announcement-sort"
            name="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            placeholder="数字越大越靠前…"
            min={0}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel htmlFor="announcement-start">开始时间</AdminLabel>
            <AdminDateTime id="announcement-start" aria-label="开始时间" value={startAt} onChange={setStartAt} />
          </div>
          <div>
            <AdminLabel htmlFor="announcement-end">结束时间</AdminLabel>
            <AdminDateTime id="announcement-end" aria-label="结束时间" value={endAt} onChange={setEndAt} />
          </div>
        </div>

        <div>
          <AdminLabel htmlFor="announcement-content" required>
            公告内容
          </AdminLabel>
          <AdminTextarea
            id="announcement-content"
            name="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              clearError('content');
            }}
            rows={8}
            placeholder="请输入公告内容…"
            maxLength={5000}
            invalid={!!errors.content}
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'announcement-content-error' : undefined}
          />
          <FieldError id="announcement-content-error">{errors.content}</FieldError>
        </div>
      </form>
    </Modal>
  );
}
