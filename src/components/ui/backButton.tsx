import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from './button';

export interface BackButtonProps {
  /** 无站内历史（直接打开 / 刷新进入）时的回退地址，默认首页 */
  fallbackTo?: string;
  /** 无障碍标签，默认「返回」 */
  label?: string;
  /** 图标尺寸 */
  size?: number;
  className?: string;
}

/**
 * 统一返回按钮：优先回退站内历史，直接打开页面时回退到 `fallbackTo`，
 * 避免 `navigate(-1)` 把用户带出站点。
 */
export function BackButton({ fallbackTo = '/', label = '返回', size = 24, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      className={`h-10 w-10 min-w-10 rounded-full p-0 text-brown hover:bg-soft ${className}`}
      onClick={handleBack}
    >
      <ChevronLeft size={size} aria-hidden="true" />
    </Button>
  );
}
