import { useState } from 'react';
import { createFollowUp, uploadAdoptPhoto } from '../../api/adopt';
import type { AdoptionFollowUpCreateRequest } from '../../types/adopt';
import { useAsync } from '../../hooks/useAsync';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { Button } from '../ui/button';

interface AdoptionFollowUpPanelProps {
  adoptionId: number;
  applicationId: number;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: 'visit', label: '上门回访' },
  { value: 'photo', label: '照片回访' },
  { value: 'online', label: '线上回访' },
] as const;

const MAX_PHOTOS = 9;

/** 领养回访提交表单（R6）：仅当事双方在详情页可见，图片走统一上传封装。 */
export function AdoptionFollowUpPanel({
  adoptionId,
  applicationId,
  onSuccess,
}: AdoptionFollowUpPanelProps) {
  const [followUpType, setFollowUpType] = useState<'visit' | 'photo' | 'online'>('visit');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { loading, run } = useAsync();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    input.value = '';
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        try {
          const res = await uploadAdoptPhoto(file);
          setPhotos((prev) => [...prev, res.url]);
        } catch {
          showErrorToast(`${file.name} 上传失败，请重试`);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      showErrorToast('请填写回访内容');
      return;
    }
    const data: AdoptionFollowUpCreateRequest = {
      adoptionId,
      applicationId,
      followUpType,
      content: content.trim(),
      photos,
      status: 1,
    };
    run(
      () => createFollowUp(data),
      () => {
        showSuccessToast('回访记录已提交');
        setContent('');
        setPhotos([]);
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '提交回访失败'),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={followUpType === option.value ? 'primary' : 'outline'}
            onClick={() => setFollowUpType(option.value)}
            aria-pressed={followUpType === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="记录一下宠物近况、饮食与适应情况…"
        maxLength={500}
        rows={3}
        aria-label="回访内容"
        className="w-full rounded-md border border-border bg-white p-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <div className="flex flex-wrap items-center gap-2">
        {photos.map((url, index) => (
          <div key={`${url}-${index}`} className="relative h-16 w-16">
            <img src={url} alt={`回访照片 ${index + 1}`} className="h-full w-full rounded-md object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
              aria-label={`删除回访照片 ${index + 1}`}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border text-2xl text-brown-light focus-within:ring-2 focus-within:ring-primary/40">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handlePhotoUpload}
              className="sr-only"
              aria-label="上传回访照片"
            />
            +
          </label>
        )}
        <span className="text-xs text-brown-muted">最多 {MAX_PHOTOS} 张</span>
      </div>

      <Button
        type="button"
        size="sm"
        disabled={loading || uploading}
        onClick={handleSubmit}
      >
        {uploading ? '图片上传中…' : loading ? '提交中…' : '提交回访'}
      </Button>
    </div>
  );
}
