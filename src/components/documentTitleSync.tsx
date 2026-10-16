import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveDocumentTitle } from '../utils/documentTitle';

/** 随路由切换浏览器页签标题，区分前台与管理后台 */
export function DocumentTitleSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = resolveDocumentTitle(pathname);
  }, [pathname]);

  return null;
}
