import { useState } from 'react';
import { useToast } from '../toast';
import { createSubmission } from '../../api/activity';
import { ActivityInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Input, Textarea } from '../ui/input';

interface SubmissionUploaderProps {
  activity: ActivityInfo;
  onSuccess?: () => void;
}

export const SubmissionUploader = ({ activity, onSuccess }: SubmissionUploaderProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');

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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    run(
      async () => {
        const response = await fetch('/api/v1/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        return result.data.url as string;
      },
      (url) => {
        setVideo(url);
        toast.success('视频上传成功');
      },
      () => toast.error('视频上传失败'),
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setVideo('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning('请填写作品标题');
      return;
    }

    if (images.length === 0 && !video) {
      toast.warning('请上传至少一张图片或一个视频');
      return;
    }

    run(
      () =>
        createSubmission({
          activityId: activity.id,
          title: title.trim(),
          description: description.trim(),
          type: video ? 'video' : 'image',
          images,
          video: video || undefined,
        }),
      () => {
        toast.success('作品提交成功');
        setTitle('');
        setDescription('');
        setImages([]);
        setVideo('');
        onSuccess?.();
      },
      (err) => toast.error((err as Error).message || '作品提交失败'),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel required>作品标题</FieldLabel>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入作品标题"
          maxLength={50}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{title.length}/50</div>
      </div>

      <div>
        <FieldLabel>作品描述</FieldLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请描述你的作品..."
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{description.length}/200</div>
      </div>

      <div>
        <FieldLabel required>上传图片</FieldLabel>
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative w-16 h-16">
              <img src={img} alt="" className="w-full h-full object-cover rounded-sm" />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 min-w-0 w-5 h-5 p-0 rounded-full text-xs"
                aria-label="删除图片"
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
        <p className="text-xs text-brown-muted mt-1">最多上传9张图片</p>
      </div>

      <div>
        <FieldLabel>上传视频（可选）</FieldLabel>
        {video ? (
          <div className="relative">
            <video src={video} className="w-full h-32 object-cover rounded-sm" controls />
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveVideo}
              className="absolute top-0 right-0 min-w-0 w-5 h-5 p-0 rounded-full text-xs"
              aria-label="删除视频"
            >
              ×
            </Button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brown-muted">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="text-center text-brown-muted">
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">{loading ? '上传中...' : '点击上传视频'}</span>
            </div>
          </label>
        )}
      </div>

      <Button type="submit" block disabled={loading} loading={loading}>
        提交作品
      </Button>
    </form>
  );
};
