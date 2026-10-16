import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

/** 前台 404：适配移动端（底栏安全区由 UserLayout 负责） */
export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '页面不存在 · 宠物社区';
  }, []);

  return (
    <div
      className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[65vh] sm:py-14"
      role="main"
      aria-labelledby="not-found-title"
    >
      <div
        className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-primary-soft text-primary sm:mb-6 sm:h-24 sm:w-24"
        aria-hidden
      >
        <PawPrint
          size={ICON_SIZE.empty}
          strokeWidth={iconStroke(ICON_SIZE.empty)}
          className="sm:scale-110"
        />
      </div>

      <p className="text-5xl font-bold leading-none tracking-tight text-primary sm:text-6xl">404</p>
      <h1 id="not-found-title" className="mt-3 text-lg font-semibold text-brown sm:mt-4 sm:text-xl">
        页面走丢了
      </h1>
      <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-brown-muted sm:max-w-sm sm:text-base">
        链接可能失效，或地址输入有误。回首页或去发现页继续逛逛吧。
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:mt-10 sm:max-w-md sm:flex-row sm:justify-center">
        <Button
          type="button"
          block
          className="min-h-11 rounded-xl sm:min-w-[9rem] sm:!w-auto"
          onClick={() => navigate('/')}
        >
          返回首页
        </Button>
        <Button
          type="button"
          variant="outline"
          block
          className="min-h-11 rounded-xl sm:min-w-[9rem] sm:!w-auto"
          onClick={() => navigate('/discover')}
        >
          去发现
        </Button>
      </div>
    </div>
  );
}
