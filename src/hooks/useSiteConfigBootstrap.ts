import { useEffect } from 'react';
import { useSiteConfigStore } from '../stores/siteConfigStore';

/**
 * 应用挂载时拉取一次站点公开配置。
 *
 * 站点名称、Logo、描述、ICP 备案号由后台「站点配置」维护，
 * 前台页签标题 / Header / 页脚都依赖它，因此需要在路由渲染前触发。
 * store 内部做 in-flight 去重，多处调用不会重复请求。
 */
export function useSiteConfigBootstrap(): void {
  const loaded = useSiteConfigStore((state) => state.loaded);
  const loadSiteConfig = useSiteConfigStore((state) => state.loadSiteConfig);

  useEffect(() => {
    if (loaded) {
      return;
    }
    void loadSiteConfig();
  }, [loaded, loadSiteConfig]);
}
