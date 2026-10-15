import { useState } from 'react';
import { useToast } from '../toast';
import { createRegistration } from '../../api/activity';
import { ActivityInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Textarea } from '../ui/input';

interface RegistrationFormProps {
  activity: ActivityInfo;
  onSuccess?: () => void;
}

export const RegistrationForm = ({ activity, onSuccess }: RegistrationFormProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/v1/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        return result.data.url;
      } catch {
        toast.error('图片上传失败');
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter((url) => url !== null) as string[];
    setImages([...images, ...validUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.warning('请填写报名理由');
      return;
    }

    run(
      () =>
        createRegistration({
          activityId: activity.id,
          content: content.trim(),
          images,
        }),
      () => {
        toast.success('报名成功');
        setContent('');
        setImages([]);
        onSuccess?.();
      },
      (err) => toast.error((err as Error).message || '报名失败'),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel required>报名理由</FieldLabel>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请说明你想参加本次活动的原因..."
          rows={4}
          maxLength={500}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{content.length}/500</div>
      </div>

      <div>
        <FieldLabel>上传图片（可选）</FieldLabel>
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative w-16 h-16">
              <img src={img} alt="" className="w-full h-full object-cover rounded-sm" />
              <Button
                type="button"
                variant="danger"
                size="sm"
                aria-label="删除图片"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 min-w-0 w-5 h-5 p-0 rounded-full text-xs"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        {images.length < 9 && (
          <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brown-muted">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <svg className="w-6 h-6 text-brown-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </label>
        )}
      </div>

      <Button type="submit" block disabled={loading}>
        {loading ? '提交中...' : '提交报名'}
      </Button>
    </form>
  );
};
