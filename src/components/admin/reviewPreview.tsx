import type { ReviewContent } from '../../types/admin';
import { AdminButton } from './adminButton';
import { AdminChip } from './adminChip';
import { adminUi } from '../../styles/adminUi';

interface ReviewPreviewProps {
  content: ReviewContent;
  onClose: () => void;
}

export function ReviewPreview({ content, onClose }: ReviewPreviewProps) {
  const images = content.images ? JSON.parse(content.images) : [];

  return (
    <div className={adminUi.overlay}>
      <div className="bg-white rounded-md shadow-hover w-full max-w-lg mx-4 animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-brown">
            {content.type === 'post' ? '动态预览' : '评论预览'}
          </h2>
          <AdminButton variant="ghost"
            type="button"
            onClick={onClose}
            className="text-brown-muted hover:text-brown transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </AdminButton>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={content.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + content.username}
              alt={content.username}
              className="w-10 h-10 rounded-full object-cover bg-soft"
            />
            <div>
              <div className="font-medium text-brown">{content.username}</div>
              <div className="text-sm text-brown-muted">{new Date(content.createdAt).toLocaleString()}</div>
            </div>
            <AdminChip
              tone={content.type === 'post' ? 'secondary' : 'neutral'}
              className="ml-auto"
            >
              {content.type === 'post' ? '动态' : '评论'}
            </AdminChip>
          </div>

          <div className="bg-soft rounded-md p-4 mb-4">
            <p className="text-brown-secondary whitespace-pre-wrap break-all">{content.content}</p>
          </div>

          {content.type === 'post' && images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`图片${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
              ))}
            </div>
          )}

          {content.video && (
            <div className="bg-muted rounded-md p-4 mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {content.type === 'comment' && content.postId && (
            <div className="text-sm text-brown-muted">
              关联动态 ID: <span className="font-mono">{content.postId}</span>
            </div>
          )}
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
