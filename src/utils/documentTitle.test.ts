import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SITE_NAME, adminDocumentTitle, resolveDocumentTitle } from './documentTitle';
import { useSiteConfigStore } from '../stores/siteConfigStore';

const resetSiteConfig = () => {
  useSiteConfigStore.setState({
    siteName: '',
    siteLogo: '',
    siteDescription: '',
    siteICP: '',
    loaded: false,
  });
};

describe('resolveDocumentTitle', () => {
  beforeEach(resetSiteConfig);

  it('未配置站点信息时回退默认站点名且不追描述', () => {
    expect(resolveDocumentTitle('/')).toBe(DEFAULT_SITE_NAME);
    expect(resolveDocumentTitle('/posts/1')).toBe(DEFAULT_SITE_NAME);
    expect(resolveDocumentTitle('/login')).toBe(DEFAULT_SITE_NAME);
  });

  it('配置站点名称与描述后前台标题拼接两者', () => {
    useSiteConfigStore.setState({ siteName: '喵星社区', siteDescription: '记录每只猫的日常' });

    expect(resolveDocumentTitle('/')).toBe('喵星社区 · 记录每只猫的日常');
    expect(resolveDocumentTitle('/posts/1')).toBe('喵星社区 · 记录每只猫的日常');
  });

  it('只配置站点名称时不补分隔符', () => {
    useSiteConfigStore.setState({ siteName: '喵星社区', siteDescription: '  ' });

    expect(resolveDocumentTitle('/login')).toBe('喵星社区');
  });

  it('后台路径使用「管理后台 · 站点名」', () => {
    useSiteConfigStore.setState({ siteName: '喵星社区' });

    expect(resolveDocumentTitle('/admin/login')).toBe('管理后台 · 喵星社区');
    expect(resolveDocumentTitle('/admin/settings')).toBe('管理后台 · 喵星社区');
    expect(adminDocumentTitle()).toBe('管理后台 · 喵星社区');
  });

  it('后台站点名未配置时回退默认站点名', () => {
    expect(adminDocumentTitle()).toBe(`管理后台 · ${DEFAULT_SITE_NAME}`);
  });
});
