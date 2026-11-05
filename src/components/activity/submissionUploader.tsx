import { useState } from 'react';
import { useToast } from '../toast';
import { createSubmission } from '../../api/activity';
import { uploadMedia } from '../../api/upload';
import { ActivityInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Input, Textarea } from '../ui/input';

interface SubmissionUploaderProps {
  activity: ActivityInfo;
  onSuccess?: () => void;
}

/** 作品图片上限（与后端 utils.MaxPostImageBytes 一致） */
const MAX_IMAGES = 9;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
/** 允许的扩展名（与后端 UploadService 白名单一致） */
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

/** 取小写扩展名，无扩展名返回空串 */
function extOf(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : '';
}

export const SubmissionUploader = ({ activity, onSuccess }: SubmissionUploaderProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    // 清空 input，保证同一文件可重复选择
    input.value = '';
    if (files.length === 0) return;

    const remain = MAX_IMAGES - images.length;
    if (remain <= 0) {
      toast.warning(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    if (files.length > remain) {
      toast.warning(`最多上传 ${MAX_IMAGES} 张图片，本次仅上传前 ${remain} 张`);
    }

    const results = await Promise.all(
      files.slice(0, remain).map(async (file) => {
        if (!IMAGE_EXTS.includes(extOf(file.name))) {
          toast.error(`${file.name} 格式不支持，仅支持 jpg/png/gif/webp/bmp`);
          return null;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          toast.error(`${file.name} 超过 5MB`);
          return null;
        }
        try {
          const { url } = await uploadMedia(file);
          return url;
        } catch {
          // 失败提示由 api/axios 拦截器统一 toast，此处不重复
          return null;
        }
      }),
    );

    const urls = results.filter((url): url is string => !!url);
    if (urls.length > 0) {
      setImages((prev) => [...prev, ...urls]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (extOf(file.name) !== 'mp4') {
      toast.error('视频仅支持 MP4 格式');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error('视频大小不得超过 50MB');
      return;
    }

    run(
      async () => {
        const { url } = await uploadMedia(file);
        return url;
      },
      (url) => {
        setVideo(url);
        toast.success('视频上传成功');
      },
      () => undefined, // 失败提示由 api/axios 拦截器统一 toast
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
        <FieldLabel htmlFor="submission-title" required>作品标题</FieldLabel>
        <Input
          id="submission-title"
          name="title"
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入作品标题…"
          maxLength={50}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{title.length}/50</div>
      </div>

      <div>
        <FieldLabel htmlFor="submission-description">作品描述</FieldLabel>
        <Textarea
          id="submission-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请描述你的作品…"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{description.length}/200</div>
      </div>

      <div>
        <FieldLabel>上传图片</FieldLabel>
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative w-16 h-16">
              <img src={img} alt="" className="w-full h-full object-cover rounded-sm" decoding="async" />
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
        {images.length < MAX_IMAGES && (
          <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brown-muted focus-within:ring-2 focus-within:ring-primary/40">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="sr-only"
              aria-label="上传作品图片"
            />
            <svg className="w-6 h-6 text-brown-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </label>
        )}
        <p className="text-xs text-brown-muted mt-1">
          最多 {MAX_IMAGES} 张，单张 ≤5MB；视频 MP4 ≤50MB
        </p>
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
          <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brown-muted focus-within:ring-2 focus-within:ring-primary/40">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="sr-only"
              aria-label="上传作品视频"
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
              <span className="text-xs">{loading ? '上传中…' : '点击上传视频'}</span>
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
