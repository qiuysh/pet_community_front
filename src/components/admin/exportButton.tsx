import { useState } from 'react';
import { AdminButton } from './adminButton';

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

  const handleExport = (type: 'overview' | 'user_growth' | 'content' | 'interaction') => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <AdminButton
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-label="导出数据"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>导出数据</span>
      </AdminButton>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-hover border border-border-light py-2 z-50 overscroll-contain">
          {exportTypes.map((type) => (
            <AdminButton
              key={type.value}
              type="button"
              variant="ghost"
              block
              onClick={() => handleExport(type.value)}
              className="!justify-start !rounded-none !px-4 !py-2 !h-auto !min-h-0 text-sm text-brown-secondary hover:!bg-secondary-soft hover:!text-secondary-dark"
            >
              {type.label}
            </AdminButton>
          ))}
        </div>
      )}
    </div>
  );
}
