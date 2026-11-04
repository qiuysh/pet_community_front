import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/site', () => ({
  getPublicSiteConfig: vi.fn(),
}));

import { getPublicSiteConfig } from '../api/site';
import { applySiteConfig, useSiteConfigStore } from './siteConfigStore';

const mockedFetch = vi.mocked(getPublicSiteConfig);

const resetStore = () => {
  useSiteConfigStore.setState({
    siteName: '',
    siteLogo: '',
    siteDescription: '',
    siteICP: '',
    loaded: false,
  });
};

describe('siteConfigStore', () => {
  beforeEach(() => {
    resetStore();
    mockedFetch.mockReset();
    localStorage.clear();
  });

  it('拉取成功后写入状态与本地缓存', async () => {
    mockedFetch.mockResolvedValue({
      siteName: '喵星社区',
      siteLogo: 'https://cdn.example.com/logo.png',
      siteDescription: '记录每只猫的日常',
      siteICP: '京ICP备00000000号',
    });

    await useSiteConfigStore.getState().loadSiteConfig();

    const state = useSiteConfigStore.getState();
    expect(state.siteName).toBe('喵星社区');
    expect(state.siteICP).toBe('京ICP备00000000号');
    expect(state.loaded).toBe(true);
    expect(JSON.parse(localStorage.getItem('site_config_cache') ?? '{}').siteName).toBe('喵星社区');
  });

  it('拉取失败时保留默认值且不标记已加载', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));

    await useSiteConfigStore.getState().loadSiteConfig();

    const state = useSiteConfigStore.getState();
    expect(state.siteName).toBe('');
    expect(state.loaded).toBe(false);
  });

  it('并发调用只发一次请求', async () => {
    mockedFetch.mockResolvedValue({
      siteName: '喵星社区',
      siteLogo: '',
      siteDescription: '',
      siteICP: '',
    });

    const store = useSiteConfigStore.getState();
    await Promise.all([store.loadSiteConfig(), store.loadSiteConfig(), store.loadSiteConfig()]);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('applySiteConfig 立即更新全局状态并落缓存', () => {
    applySiteConfig({
      siteName: '新站点名',
      siteLogo: '',
      siteDescription: '新描述',
      siteICP: '',
    });

    const state = useSiteConfigStore.getState();
    expect(state.siteName).toBe('新站点名');
    expect(state.loaded).toBe(true);
    expect(JSON.parse(localStorage.getItem('site_config_cache') ?? '{}').siteDescription).toBe('新描述');
  });
});
