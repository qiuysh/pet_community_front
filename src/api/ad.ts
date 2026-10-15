// 前台广告展示 API
// 与 admin 广告 CRUD 接口分离:此处仅查询生效中的广告 + PV/Click 上报,
// 全部为公开端点,不携带 user_token / admin_token 之外的特殊鉴权。
import { get, post } from './axios';
import { Advertisement, AdLocation } from '../types/advertisement';

/**
 * 拉取指定位置当前生效中的广告列表。
 * 服务端按 location 过滤 + 时间窗 + status=1 + 位置 status=1,
 * 因此前端无需再做二次过滤。
 */
export const getActiveAds = async (location: AdLocation): Promise<Advertisement[]> => {
    const params = { params: { location } };
    return await get<Advertisement[]>('/api/v1/ads', params);
};

/**
 * 上报广告曝光 PV。前台广告位组件渲染后 fire-and-forget 调用一次,
 * 失败静默吞掉,避免阻塞展示。
 */
export const incrementAdView = async (id: number): Promise<void> => {
    try {
        await post<void>(`/api/v1/ads/${id}/view`);
    } catch {
        // 静默失败:PV 上报失败不应影响用户浏览体验
    }
};

/**
 * 上报广告点击。点击通常是 <a target="_blank"> 跳转,fire-and-forget 即可。
 */
export const incrementAdClick = async (id: number): Promise<void> => {
    try {
        await post<void>(`/api/v1/ads/${id}/click`);
    } catch {
        // 静默失败:点击上报失败不应阻断跳转
    }
};
