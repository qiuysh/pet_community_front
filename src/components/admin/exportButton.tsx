import { useEffect, useId, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { AdminButton, adminButtonClass } from './adminButton';

interface ExportButtonProps {
  onExport: (type: 'overview' | 'user_growth' | 'content' | 'interaction') => void;
}

const exportTypes = [
  { value: 'overview' as const, label: '概览统计' },
  { value: 'user_growth' as const, label: '用户增长' },
  { value: 'content' as const, label: '内容统计' },
  { value: 'interaction' as const, label: '互动统计' },
];

/** 导出菜单：触发器与菜单项均走 AdminButton（HeroUI 桥接） */
export function ExportButton({ onExport }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleExport = (type: 'overview' | 'user_growth' | 'content' | 'interaction') => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <AdminButton
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-label="导出数据"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
      >
        <Download
          size={ICON_SIZE.inline}
          strokeWidth={iconStroke(ICON_SIZE.inline)}
          aria-hidden="true"
        />
        <span>导出数据</span>
      </AdminButton>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="导出类型"
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-hover border border-border-light py-2 z-50 overscroll-contain"
        >
          {exportTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              role="menuitem"
              onClick={() => handleExport(type.value)}
              className={adminButtonClass({
                variant: 'ghost',
                block: true,
                className:
                  '!justify-start !rounded-none !px-4 !py-2 !h-auto !min-h-0 text-sm text-brown-secondary hover:!bg-secondary-soft hover:!text-secondary-dark',
              })}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
