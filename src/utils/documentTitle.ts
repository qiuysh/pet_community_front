import { useSiteConfigStore } from '../stores/siteConfigStore';

/** 站点未配置时的兜底名称（与 index.html 静态 title 保持一致） */
export const DEFAULT_SITE_NAME = '宠物社区';

/** 后台页签标题，与前台页签区分 */
export function adminDocumentTitle(): string {
  const name = useSiteConfigStore.getState().siteName.trim() || DEFAULT_SITE_NAME;
  return `管理后台 · ${name}`;
}

/**
 * 按路由解析浏览器页签标题。
 * 站点名 / 描述取后台「站点配置」，未配置时回退默认站点名且不追描述。
 */
export function resolveDocumentTitle(pathname: string): string {
  if (pathname.startsWith('/admin')) {
    return adminDocumentTitle();
  }
  const { siteName, siteDescription } = useSiteConfigStore.getState();
  const name = siteName.trim() || DEFAULT_SITE_NAME;
  const desc = siteDescription.trim();
  return desc ? `${name} · ${desc}` : name;
}
