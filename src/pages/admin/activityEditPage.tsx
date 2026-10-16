import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/toast';
import { useAsyncEffect, useAsync } from '../../hooks/useAsync';
import {
  getActivityDetail,
  updateActivity,
  deleteActivity,
  publishActivity,
} from '../../api/activity';
import { ActivityType, ActivityStatus, ActivityTypeOptions } from '../../types/activity';
import { toDateTimeLocal, toRFC3339 } from '../../utils/activityDateTime';
import {
  AdminDateTime,
  AdminHint,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminChip } from '../../components/admin/adminChip';
import { adminUi } from '../../styles/adminUi';

export const ActivityEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data: activity } = useAsyncEffect(
    () => getActivityDetail(parseInt(id!, 10)),
    [id],
    {
      onSuccess: (data) => {
        setFormData({
          title: data.title,
          description: data.description,
          type: (data.type as ActivityType) || ActivityType.VOTING,
          cover: data.cover || '',
          startTime: toDateTimeLocal(data.startTime),
          endTime: toDateTimeLocal(data.endTime),
          maxParticipants: data.maxParticipants?.toString() || '',
          maxSubmissions: data.maxSubmissions?.toString() || '1',
          votesPerDay: data.votesPerDay?.toString() || '10',
          rules: data.rules || '',
          prizes: data.prizes || '',
          requireApproval: !!data.requireApproval,
        });
        setStatus(data.status);
      },
      onError: (err: unknown) => {
        toast.error((err instanceof Error ? err.message : '') || '加载活动失败');
        navigate('/admin/activities');
      },
    },
  );
  const { loading, run } = useAsync();
  const { loading: deleting, run: runDelete } = useAsync();
  const { loading: publishing, run: runPublish } = useAsync();
  const [status, setStatus] = useState<number>(ActivityStatus.DRAFT);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ActivityType.VOTING,
    cover: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    maxSubmissions: '1',
    votesPerDay: '10',
    rules: '',
    prizes: '',
    requireApproval: false,
  });

  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();
      setFormData((prev) => ({ ...prev, cover: result.data.url }));
      toast.success('封面上传成功');
    } catch {
      toast.error('封面上传失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning('请填写活动标题');
      return;
    }
    if (!formData.description.trim()) {
      toast.warning('请填写活动描述');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.warning('请选择活动开始和结束时间');
      return;
    }

    await run(
      () =>
        updateActivity(parseInt(id!, 10), {
          title: formData.title.trim(),
          description: formData.description.trim(),
          cover: formData.cover || undefined,
          startTime: toRFC3339(formData.startTime),
          endTime: toRFC3339(formData.endTime),
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : 0,
          maxSubmissions: formData.maxSubmissions ? parseInt(formData.maxSubmissions, 10) : 1,
          votesPerDay: formData.votesPerDay ? parseInt(formData.votesPerDay, 10) : 10,
          rules: formData.rules.trim() || undefined,
          prizes: formData.prizes.trim() || undefined,
          requireApproval: formData.requireApproval,
        }),
      () => {
        toast.success('活动更新成功');
        navigate('/admin/activities');
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动更新失败'),
    );
  };

  const handlePublish = () => {
    runPublish(
      () => publishActivity(parseInt(id!, 10)),
      () => {
        setStatus(ActivityStatus.PUBLISHED);
        toast.success('活动已发布');
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '发布失败'),
    );
  };

  const handleDelete = () => {
    if (!window.confirm('确定要删除这个活动吗？此操作不可恢复。')) {
      return;
    }

    runDelete(
      () => deleteActivity(parseInt(id!, 10)),
      () => {
        toast.success('活动删除成功');
        navigate('/admin/activities');
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动删除失败'),
    );
  };

  if (!activity) {
    return <div className="p-6 text-center">加载中…</div>;
  }

  const isDraft = status === ActivityStatus.DRAFT;

  return (
    <div className="bg-white rounded-md shadow-card animate-fadeIn p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className={adminUi.pageTitle}>编辑活动</h1>
          <AdminChip tone={isDraft ? 'neutral' : 'success'}>{isDraft ? '草稿' : '已发布'}</AdminChip>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <AdminButton type="button" variant="secondary" onClick={handlePublish} disabled={publishing} loading={publishing}>
              {publishing ? '发布中…' : '发布活动'}
            </AdminButton>
          )}
          <AdminButton type="button" variant="danger" onClick={handleDelete} disabled={deleting} loading={deleting}>
            {deleting ? '删除中…' : '删除活动'}
          </AdminButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <AdminLabel required>活动标题</AdminLabel>
          <AdminInput
            name="title"
            value={formData.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="请输入活动标题…"
            maxLength={100}
            disabled={!isDraft}
          />
        </div>

        <div>
          <AdminLabel>活动类型</AdminLabel>
          <AdminSelect name="type" value={formData.type} disabled>
            {ActivityTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
          <AdminHint>类型创建后不可修改</AdminHint>
        </div>

        <div>
          <AdminLabel required>活动描述</AdminLabel>
          <AdminTextarea
            name="description"
            value={formData.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="请输入活动描述…"
            rows={4}
            maxLength={500}
            disabled={!isDraft}
          />
        </div>

        <div>
          <AdminLabel>活动封面</AdminLabel>
          {formData.cover ? (
            <div className="relative inline-block">
              <img src={formData.cover} alt="封面" width={128} height={128} className="w-32 h-32 object-cover rounded-sm" />
              {isDraft && (
                <AdminButton
                  type="button"
                  variant="danger"
                  size="sm"
                  aria-label="移除封面"
                  onClick={() => setFormData((prev) => ({ ...prev, cover: '' }))}
                  className="!absolute !top-0 !right-0 !h-6 !min-h-6 !w-6 !p-0 !rounded-full"
                >
                  ×
                </AdminButton>
              )}
            </div>
          ) : (
            isDraft && (
              <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border-light rounded-sm cursor-pointer hover:border-border">
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <span className="text-xs text-brown-muted">上传封面</span>
              </label>
            )
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel required>开始时间</AdminLabel>
            <AdminDateTime
              aria-label="开始时间"
              value={formData.startTime}
              onChange={(value) => setField('startTime', value)}
              disabled={!isDraft}
            />
          </div>
          <div>
            <AdminLabel required>结束时间</AdminLabel>
            <AdminDateTime
              aria-label="结束时间"
              value={formData.endTime}
              onChange={(value) => setField('endTime', value)}
              disabled={!isDraft}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel>最大参与人数</AdminLabel>
            <AdminInput
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setField('maxParticipants', e.target.value)}
              min={0}
            />
          </div>
          <div>
            <AdminLabel>每人每日票数</AdminLabel>
            <AdminInput
              type="number"
              value={formData.votesPerDay}
              onChange={(e) => setField('votesPerDay', e.target.value)}
              min={1}
              max={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel>每人作品上限</AdminLabel>
            <AdminInput
              type="number"
              value={formData.maxSubmissions}
              onChange={(e) => setField('maxSubmissions', e.target.value)}
              min={1}
              max={10}
            />
          </div>
          <div className="flex items-end pb-2">
            <AdminCheckbox
              checked={formData.requireApproval}
              onChange={(checked) => setField('requireApproval', checked)}
            >
              报名需审核
            </AdminCheckbox>
          </div>
        </div>

        <div>
          <AdminLabel>活动规则</AdminLabel>
          <AdminTextarea
            value={formData.rules}
            onChange={(e) => setField('rules', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <AdminLabel>奖品设置</AdminLabel>
          <AdminTextarea
            value={formData.prizes}
            onChange={(e) => setField('prizes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <AdminButton type="submit" variant="secondary" disabled={loading} loading={loading}>
            {loading ? '保存中…' : '保存修改'}
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={() => navigate('/admin/activities')}>
            返回列表
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/activities/${id}/registrations`)}
          >
            报名审核
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/activities/${id}/vote`)}
          >
            评选管理
          </AdminButton>
        </div>
      </form>
    </div>
  );
};
