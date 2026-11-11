import { get } from './axios';
import { SiteConfig } from '../types/site';

/**
 * 拉取站点公开配置（站点名称 / Logo / 描述 / ICP 备案号）。
 * 公开端点，不要求登录；后台「站点配置」保存后前台刷新即可读到新值。
 */
export const getPublicSiteConfig = async (): Promise<SiteConfig> => {
  return await get<SiteConfig>('/api/v1/site/config');
};
