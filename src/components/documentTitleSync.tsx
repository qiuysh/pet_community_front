import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveDocumentTitle } from '../utils/documentTitle';
import { useSiteConfigStore } from '../stores/siteConfigStore';

/** 随路由切换浏览器页签标题，区分前台与管理后台 */
export function DocumentTitleSync() {
  const { pathname } = useLocation();
  // 站点配置异步到达后需要重算标题，否则首屏停在兜底名称
  const siteName = useSiteConfigStore((state) => state.siteName);
  const siteDescription = useSiteConfigStore((state) => state.siteDescription);

  useEffect(() => {
    document.title = resolveDocumentTitle(pathname);
  }, [pathname, siteName, siteDescription]);

  return null;
}
