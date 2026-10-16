import { useState, useEffect } from 'react';
import type { Advertisement, AdPosition, CreateAdRequest, UpdateAdRequest } from '../../types/advertisement';
import { AdLocationMap } from '../../types/advertisement';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { createAd, updateAd, getAdPositionList } from '../../api/admin';
import { useAsync, useAsyncEffect } from '../../hooks/useAsync';
import { AdminButton } from './adminButton';
import { AdminDateTime, AdminHint, AdminInput, AdminLabel, AdminSelect } from './adminField';
import { adminUi } from '../../styles/adminUi';

interface AdFormProps {
  ad?: Advertisement | null;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function AdForm({ ad, onSubmit, onCancel }: AdFormProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [positionId, setPositionId] = useState<number>(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const { loading, run } = useAsync();
  const [positions, setPositions] = useState<AdPosition[]>([]);

  useAsyncEffect(() => getAdPositionList({ page: 1, page_size: 100 }), [], {
    onSuccess: (res) => {
      const list = res.list ?? [];
      // 仅可选启用中的广告位；若全部被误禁用则仍展示并标注，避免下拉空白
      const enabled = list.filter((p) => p.status === 1);
      setPositions(enabled.length > 0 ? enabled : list);
    },
    onError: (err) => showErrorToast((err as Error).message || '获取广告位列表失败'),
  });

  useEffect(() => {
    if (ad) {
      setTitle(ad.title);
      setImageUrl(ad.imageUrl);
      setLinkUrl(ad.linkUrl);
      setPositionId(ad.positionId);
      setStartTime(ad.startTime.substring(0, 16));
      setEndTime(ad.endTime.substring(0, 16));
    }
  }, [ad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showErrorToast('请输入广告标题');
      return;
    }
    if (!imageUrl.trim()) {
      showErrorToast('请输入广告图片URL');
      return;
    }
    if (!positionId) {
      showErrorToast('请选择广告位');
      return;
    }
    if (!startTime) {
      showErrorToast('请选择开始时间');
      return;
    }
    if (!endTime) {
      showErrorToast('请选择结束时间');
      return;
    }
    if (endTime <= startTime) {
      showErrorToast('结束时间不能早于开始时间');
      return;
    }

    run(
      async () => {
        if (ad) {
          const data: UpdateAdRequest = {
            title,
            imageUrl,
            linkUrl,
            positionId,
            startTime: startTime + ':00',
            endTime: endTime + ':00',
          };
          await updateAd(ad.id, data);
        } else {
          const data: CreateAdRequest = {
            title,
            imageUrl,
            linkUrl,
            positionId,
            startTime: startTime + ':00',
            endTime: endTime + ':00',
          };
          await createAd(data);
        }
      },
      () => {
        showSuccessToast(ad ? '广告更新成功' : '广告创建成功');
        onSubmit?.();
      },
      (err) => showErrorToast((err as Error).message || '操作失败'),
    );
  };

  return (
    <div className={`${adminUi.panel} p-6`}>
      <h2 className="text-xl font-bold text-brown mb-6">{ad ? '编辑广告' : '创建广告'}</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <AdminLabel required>广告标题</AdminLabel>
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="请输入广告标题"
            />
          </div>

          <div>
            <AdminLabel required>广告位</AdminLabel>
            <AdminSelect
              aria-label="广告位"
              value={positionId ? String(positionId) : ''}
              onChange={(e) => setPositionId(Number(e.target.value) || 0)}
            >
              <option value="">请选择广告位</option>
              {positions.map((p) => (
                <option key={p.id} value={String(p.id)} disabled={p.status !== 1}>
                  {p.name}（{AdLocationMap[p.location as keyof typeof AdLocationMap] || p.location}
                  {p.status !== 1 ? ' · 已禁用' : ''}）
                </option>
              ))}
            </AdminSelect>
            {positions.length === 0 && (
              <AdminHint>暂无广告位，请先在「广告位」中创建并启用</AdminHint>
            )}
            {positions.length > 0 && positions.every((p) => p.status !== 1) && (
              <AdminHint>广告位均已禁用，请先在「广告位」中重新启用</AdminHint>
            )}
          </div>
        </div>

        <div>
          <AdminLabel required>广告图片URL</AdminLabel>
          <AdminInput
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="请输入广告图片URL"
          />
          {imageUrl && (
            <div className="mt-3">
              <img
                src={imageUrl}
                alt="广告预览"
                className="max-w-xs max-h-32 object-contain rounded-md border border-border"
              />
            </div>
          )}
        </div>

        <div>
          <AdminLabel>跳转链接URL</AdminLabel>
          <AdminInput
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="请输入跳转链接URL（可选）"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <AdminLabel required>开始时间</AdminLabel>
            <AdminDateTime aria-label="开始时间" value={startTime} onChange={setStartTime} />
          </div>
          <div>
            <AdminLabel required>结束时间</AdminLabel>
            <AdminDateTime aria-label="结束时间" value={endTime} onChange={setEndTime} />
            <AdminHint>结束时间需晚于开始时间</AdminHint>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <AdminButton type="submit" variant="secondary" disabled={loading} loading={loading}>
            {loading ? '处理中…' : ad ? '保存修改' : '创建广告'}
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={onCancel}>
            取消
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
