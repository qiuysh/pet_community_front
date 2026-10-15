import { useState, useEffect } from 'react';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/admin';
import { createAnnouncement, updateAnnouncement } from '../../api/admin';
import { showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { AdminButton } from './adminButton';
import { AdminDateTime, AdminInput, AdminLabel, AdminSelect, AdminTextarea } from './adminField';
import { adminUi } from '../../styles/adminUi';

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

export function AnnouncementForm({ announcement, onClose, onSuccess }: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState(1);
  const [sortOrder, setSortOrder] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!title.trim() || !content.trim()) {
      showErrorToast('请填写完整信息');
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
    <div className={adminUi.overlay}>
      <div className="bg-white rounded-md shadow-hover w-full max-w-lg mx-4 animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-white shrink-0">
          <h2 className="text-lg font-semibold text-brown">
            {announcement ? '编辑公告' : '发布公告'}
          </h2>
          <AdminButton variant="ghost" type="button" onClick={onClose} aria-label="关闭" className="text-brown-muted hover:text-brown transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </AdminButton>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto min-h-0 bg-white">
          <div>
            <AdminLabel required>公告标题</AdminLabel>
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入公告标题"
              maxLength={200}
            />
          </div>

          <div>
            <AdminLabel>公告类型</AdminLabel>
            <AdminSelect
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
            <AdminLabel>排序权重</AdminLabel>
            <AdminInput
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="数字越大越靠前"
              min={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <AdminLabel>开始时间</AdminLabel>
              <AdminDateTime aria-label="开始时间" value={startAt} onChange={setStartAt} />
            </div>
            <div>
              <AdminLabel>结束时间</AdminLabel>
              <AdminDateTime aria-label="结束时间" value={endAt} onChange={setEndAt} />
            </div>
          </div>

          <div>
            <AdminLabel required>公告内容</AdminLabel>
            <AdminTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="请输入公告内容"
              maxLength={5000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <AdminButton type="button" variant="outline" onClick={onClose}>
              取消
            </AdminButton>
            <AdminButton type="submit" variant="secondary" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? '提交中...' : announcement ? '保存修改' : '发布公告'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}
