import { create } from 'zustand';
import { getPublicSiteConfig } from '../api/site';
import { SiteConfig } from '../types/site';

/** 首屏缓存 key：命中后先渲染，再静默校正，避免站点名闪现默认值 */
const CACHE_KEY = 'site_config_cache';

const EMPTY_CONFIG: SiteConfig = {
  siteName: '',
  siteLogo: '',
  siteDescription: '',
  siteICP: '',
};

/** 读取本地缓存（结构不符或解析失败时回退空配置） */
const readCachedConfig = (): SiteConfig => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return EMPTY_CONFIG;
    }
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return {
      siteName: typeof parsed.siteName === 'string' ? parsed.siteName : '',
      siteLogo: typeof parsed.siteLogo === 'string' ? parsed.siteLogo : '',
      siteDescription: typeof parsed.siteDescription === 'string' ? parsed.siteDescription : '',
      siteICP: typeof parsed.siteICP === 'string' ? parsed.siteICP : '',
    };
  } catch {
    return EMPTY_CONFIG;
  }
};

const writeCachedConfig = (config: SiteConfig): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch {
    // 隐私模式 / 配额满时忽略缓存失败，不影响内存态
  }
};

interface SiteConfigStore extends SiteConfig {
  /** 是否已从服务端拉取过（失败不置 true，便于下次重试） */
  loaded: boolean;
  loadSiteConfig: () => Promise<void>;
}

/** 模块级 in-flight 去重：多个组件同时触发只发一次请求 */
let inFlight: Promise<void> | null = null;

export const useSiteConfigStore = create<SiteConfigStore>((set) => ({
  ...readCachedConfig(),
  loaded: false,

  loadSiteConfig: async () => {
    if (inFlight) {
      return inFlight;
    }
    inFlight = (async () => {
      try {
        const config = await getPublicSiteConfig();
        set({ ...config, loaded: true });
        writeCachedConfig(config);
      } catch {
        // 站点配置缺失不应阻断页面渲染，保留缓存值与组件内默认值
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },
}));

/** 保存成功后主动校正全局状态（后台改完站点名，前台立即生效） */
export const applySiteConfig = (config: SiteConfig): void => {
  useSiteConfigStore.setState({ ...config, loaded: true });
  writeCachedConfig(config);
};
