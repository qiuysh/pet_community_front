import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './imageLightbox.scss';

export interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

/** 图片大图查看（聊天/动态共用；1x/2x 缩放，Esc / 点击遮罩关闭） */
export function ImageLightbox({ open, src, alt = '图片消息', onClose }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(open && !!src);

  useEffect(() => {
    if (!open) {
      setZoomed(false);
      return;
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open || !src) return null;

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      tabIndex={-1}
      ref={trapRef}
      onClick={onClose}
    >
      <div className="image-lightbox__toolbar" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="image-lightbox__icon-btn"
          aria-label={zoomed ? '缩小图片' : '放大图片'}
          onClick={() => setZoomed((prev) => !prev)}
        >
          {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
        <button
          type="button"
          className="image-lightbox__icon-btn"
          aria-label="关闭大图"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <img
        decoding="async"
        className={`image-lightbox__image${zoomed ? ' zoomed' : ''}`}
        src={src}
        alt={alt}
        onClick={(event) => {
          event.stopPropagation();
          setZoomed((prev) => !prev);
        }}
      />
    </div>,
    document.body,
  );
}
