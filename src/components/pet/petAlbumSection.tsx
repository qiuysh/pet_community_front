import { useRef, useState } from 'react';
import { Camera, Trash2, ImagePlus, Star, Video, GripVertical } from 'lucide-react';
import type { PetAlbumInfo } from '../../types/pet';
import { getPetTypeIcon } from '../../types/pet';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Modal } from '../ui/modal';

interface PetAlbumSectionProps {
  album: PetAlbumInfo[];
  petType: number;
  coverUrl?: string;
  isOwner: boolean;
  uploading: boolean;
  onUploadPhotos: (files: FileList) => void;
  onUploadVideo: (file: File) => void;
  onDelete: (photoId: number) => void;
  onSetCover: (imageUrl: string) => void;
  onReorder: (orderedIds: number[]) => void;
}

export function PetAlbumSection({
  album,
  petType,
  coverUrl,
  isOwner,
  uploading,
  onUploadPhotos,
  onUploadVideo,
  onDelete,
  onSetCover,
  onReorder,
}: PetAlbumSectionProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const PetIcon = getPetTypeIcon(petType);

  const moveItem = (fromId: number, toId: number) => {
    if (fromId === toId) return;
    const ids = album.map((item) => item.id);
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...ids];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder(next);
  };

  return (
    <Card className="rounded-xl shadow-sm" padding="lg">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-medium text-brown">相册</h3>
          {isOwner && album.length > 1 && (
            <p className="text-xs text-brown-muted mt-1">拖拽卡片可调整顺序</p>
          )}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  onUploadPhotos(e.target.files);
                  e.target.value = '';
                }
              }}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUploadVideo(file);
                  e.target.value = '';
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => photoInputRef.current?.click()}
              className="rounded-lg gap-1.5"
            >
              <ImagePlus size={16} aria-hidden="true" />
              {uploading ? '上传中…' : '上传照片'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => videoInputRef.current?.click()}
              className="rounded-lg gap-1.5 border-primary text-primary"
            >
              <Video size={16} aria-hidden="true" />
              上传视频
            </Button>
          </div>
        )}
      </div>

      {album.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {album.map((item, index) => {
            const isVideo = item.mediaType === 'video';
            const isCover = !isVideo && !!coverUrl && item.imageUrl === coverUrl;
            const isDragging = dragId === item.id;
            const isOver = overId === item.id && dragId !== item.id;

            return (
              <div
                key={item.id}
                draggable={isOwner}
                onDragStart={(e) => {
                  if (!isOwner) return;
                  setDragId(item.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', String(item.id));
                }}
                onDragOver={(e) => {
                  if (!isOwner || dragId === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (overId !== item.id) setOverId(item.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isOwner || dragId === null) return;
                  moveItem(dragId, item.id);
                  setDragId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`group relative aspect-square bg-muted rounded-lg overflow-hidden transition-all ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${isOver ? 'ring-2 ring-primary ring-offset-1' : ''} ${
                  isOwner ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                {item.imageUrl ? (
                  isVideo ? (
                    <video
                      src={item.imageUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      controls
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title || `照片 ${index + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown-muted">
                    <PetIcon size={32} aria-hidden="true" />
                  </div>
                )}

                {isVideo && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-xs bg-black/60 text-white rounded">
                    视频
                  </span>
                )}
                {isCover && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded">
                    封面
                  </span>
                )}

                {isOwner && (
                  <div className="absolute top-2 right-2 p-1.5 rounded bg-black/40 text-white opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 transition-opacity">
                    <GripVertical size={14} aria-hidden="true" />
                  </div>
                )}

                {isOwner && (
                  <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1 opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 transition-opacity bg-linear-to-t from-black/60 to-transparent">
                    {!isVideo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetCover(item.imageUrl)}
                        className="flex-1 min-h-9 h-auto py-2 text-xs text-white bg-white/20 rounded hover:bg-white/30"
                        aria-label="设为封面"
                      >
                        <Star size={12} aria-hidden="true" />
                        封面
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmId(item.id)}
                      className="min-h-9 min-w-9 h-auto p-2 bg-error/80 rounded hover:bg-error"
                      aria-label="删除"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-3 flex justify-center text-brown-light">
            <Camera size={32} aria-hidden="true" />
          </div>
          <p className="text-brown-muted">暂无相册内容</p>
          {isOwner && (
            <p className="text-sm text-brown-muted mt-2">
              照片每次最多 9 张（≤5MB）；视频 MP4（≤1 分钟 / 50MB）
            </p>
          )}
        </div>
      )}

      <Modal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title="删除相册项"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>
              取消
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (confirmId !== null) {
                  onDelete(confirmId);
                  setConfirmId(null);
                }
              }}
            >
              删除
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brown-muted">确定删除吗？此操作不可恢复。</p>
      </Modal>
    </Card>
  );
}
