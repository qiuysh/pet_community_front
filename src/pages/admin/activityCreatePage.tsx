import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/toast';
import { useAsync } from '../../hooks/useAsync';
import { createActivity } from '../../api/activity';
import { ActivityType, ActivityStatus, ActivityTypeOptions } from '../../types/activity';
import {
  AdminDateTime,
  AdminHint,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { adminUi } from '../../styles/adminUi';

export const ActivityCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, run } = useAsync();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ActivityType.ONLINE_VOTE,
    cover: '',
    images: [] as string[],
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    voteStartTime: '',
    voteEndTime: '',
    maxParticipants: '',
    maxVotesPerUser: '3',
    rules: '',
    prizes: '',
    location: '',
    status: ActivityStatus.DRAFT,
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

    if (!formData.cover) {
      toast.warning('请上传活动封面');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.warning('请选择活动开始和结束时间');
      return;
    }

    await run(
      () =>
        createActivity({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          cover: formData.cover,
          images: formData.images,
          startTime: formData.startTime,
          endTime: formData.endTime,
          registrationDeadline: formData.registrationDeadline || undefined,
          voteStartTime: formData.voteStartTime || undefined,
          voteEndTime: formData.voteEndTime || undefined,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
          maxVotesPerUser: formData.maxVotesPerUser ? parseInt(formData.maxVotesPerUser) : undefined,
          rules: formData.rules.trim() || undefined,
          prizes: formData.prizes.trim() || undefined,
          location: formData.location.trim() || undefined,
          status: formData.status,
        }),
      () => {
        toast.success('活动创建成功');
        navigate('/admin/activities');
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动创建失败'),
    );
  };

  return (
    <div className="bg-white rounded-md shadow-card animate-fadeIn p-6">
      <div className="mb-6">
        <h1 className={adminUi.pageTitle}>创建活动</h1>
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
          />
        </div>

        <div>
          <AdminLabel required>活动类型</AdminLabel>
          <AdminSelect
            name="type"
            value={formData.type}
            onChange={(e) => setField('type', e.target.value as ActivityType)}
          >
            {ActivityTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
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
          />
        </div>

        <div>
          <AdminLabel required>活动封面</AdminLabel>
          {formData.cover ? (
            <div className="relative inline-block">
              <img src={formData.cover} alt="封面" width={128} height={128} className="w-32 h-32 object-cover rounded-sm" />
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
            </div>
          ) : (
            <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border-light rounded-sm cursor-pointer hover:border-border">
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              <div className="text-center text-brown-muted">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-4-4h6m-6 0v6" />
                </svg>
                <span className="text-xs">上传封面</span>
              </div>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel required>开始时间</AdminLabel>
            <AdminDateTime
              aria-label="开始时间"
              value={formData.startTime}
              onChange={(value) => setField('startTime', value)}
            />
          </div>
          <div>
            <AdminLabel required>结束时间</AdminLabel>
            <AdminDateTime
              aria-label="结束时间"
              value={formData.endTime}
              onChange={(value) => setField('endTime', value)}
            />
          </div>
        </div>

        {formData.type === ActivityType.ONLINE_VOTE && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AdminLabel>报名截止时间</AdminLabel>
                <AdminDateTime
                  aria-label="报名截止时间"
                  value={formData.registrationDeadline}
                  onChange={(value) => setField('registrationDeadline', value)}
                />
              </div>
              <div>
                <AdminLabel>投票开始时间</AdminLabel>
                <AdminDateTime
                  aria-label="投票开始时间"
                  value={formData.voteStartTime}
                  onChange={(value) => setField('voteStartTime', value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AdminLabel>投票结束时间</AdminLabel>
                <AdminDateTime
                  aria-label="投票结束时间"
                  value={formData.voteEndTime}
                  onChange={(value) => setField('voteEndTime', value)}
                />
              </div>
              <div>
                <AdminLabel>每人最大投票数</AdminLabel>
                <AdminInput
                  type="number"
                  name="maxVotesPerUser"
                  value={formData.maxVotesPerUser}
                  onChange={(e) => setField('maxVotesPerUser', e.target.value)}
                  placeholder="例如 3…"
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel>最大参与人数</AdminLabel>
            <AdminInput
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={(e) => setField('maxParticipants', e.target.value)}
              placeholder="不限…"
              min={1}
            />
            <AdminHint>留空表示不限</AdminHint>
          </div>
          <div>
            <AdminLabel>活动地点</AdminLabel>
            <AdminInput
              name="location"
              value={formData.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="请输入活动地点…"
            />
          </div>
        </div>

        <div>
          <AdminLabel>活动规则</AdminLabel>
          <AdminTextarea
            name="rules"
            value={formData.rules}
            onChange={(e) => setField('rules', e.target.value)}
            placeholder="请输入活动规则…"
            rows={3}
          />
        </div>

        <div>
          <AdminLabel>奖品设置</AdminLabel>
          <AdminTextarea
            name="prizes"
            value={formData.prizes}
            onChange={(e) => setField('prizes', e.target.value)}
            placeholder="请输入奖品设置…"
            rows={3}
          />
        </div>

        <div>
          <AdminLabel>发布状态</AdminLabel>
          <AdminSelect
            name="status"
            value={formData.status}
            onChange={(e) => setField('status', Number(e.target.value) as ActivityStatus)}
          >
            <option value={ActivityStatus.DRAFT}>草稿</option>
            <option value={ActivityStatus.PUBLISHED}>发布</option>
          </AdminSelect>
        </div>

        <div className="flex gap-4">
          <AdminButton type="submit" variant="secondary" disabled={loading} loading={loading}>
            {loading ? '提交中…' : '创建活动'}
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={() => navigate('/admin/activities')}>
            取消
          </AdminButton>
        </div>
      </form>
    </div>
  );
};
