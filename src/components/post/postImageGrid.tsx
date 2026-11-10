import { useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Plus, X } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { moveListItem } from '../../utils/reorderList';
import { Button } from '../ui/button';

export interface PostImageGridProps {
  images: string[];
  onChange: (next: string[]) => void;
  onAddClick: () => void;
  maxCount?: number;
}

/**
 * 发布页多图网格（R10）：HTML5 拖拽排序 + 上移/下移按钮；首图为封面。
 */
export function PostImageGrid({
  images,
  onChange,
  onAddClick,
  maxCount = 9,
}: PostImageGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveTo = (from: number, to: number) => {
    const next = moveListItem(images, from, to);
    if (next !== images) onChange(next);
  };

  return (
    <div className="image-grid" role="list" aria-label="已选图片，可拖拽或使用按钮调整顺序">
      {images.map((img, idx) => {
        const isDragging = dragIndex === idx;
        const isOver = overIndex === idx && dragIndex !== null && dragIndex !== idx;
        return (
          <div
            key={`${img}-${idx}`}
            className={`image-item${isDragging ? ' is-dragging' : ''}${isOver ? ' is-over' : ''}`}
            role="listitem"
            draggable
            onDragStart={(e) => {
              setDragIndex(idx);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(idx));
            }}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (overIndex !== idx) setOverIndex(idx);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex === null) return;
              moveTo(dragIndex, idx);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <img src={img} alt="" decoding="async" draggable={false} />
            {idx === 0 && <span className="cover-badge">封面</span>}
            <span className="drag-handle" aria-hidden="true">
              <GripVertical size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} />
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="remove-btn"
              onClick={() => removeAt(idx)}
              aria-label={`删除第 ${idx + 1} 张图片`}
            >
              <X size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
            </Button>
            {images.length > 1 && (
              <div className="reorder-actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="reorder-btn"
                  disabled={idx === 0}
                  onClick={() => moveTo(idx, idx - 1)}
                  aria-label={`将第 ${idx + 1} 张图片上移`}
                >
                  <ChevronLeft size={ICON_SIZE.inline} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="reorder-btn"
                  disabled={idx === images.length - 1}
                  onClick={() => moveTo(idx, idx + 1)}
                  aria-label={`将第 ${idx + 1} 张图片下移`}
                >
                  <ChevronRight size={ICON_SIZE.inline} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      {images.length < maxCount && (
        <button type="button" className="add-image-btn" onClick={onAddClick} aria-label="添加图片">
          <span className="plus">
            <Plus size={ICON_SIZE.nav} strokeWidth={iconStroke(ICON_SIZE.nav)} aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}

export default PostImageGrid;
