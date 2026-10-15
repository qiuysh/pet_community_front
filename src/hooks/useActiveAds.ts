import { useAsyncEffect } from './useAsync';
import { getActiveAds } from '../api/ad';
import { AdLocation } from '../types/advertisement';
import { useToast } from '../components/toast';

/**
 * 前台广告位加载 hook:按 location 拉取生效中的广告。
 * 失败仅 toast 提示一次,不阻塞页面渲染。
 *
 * 用法:
 *   const { loading, ads } = useActiveAds('home_banner');
 *   if (loading || ads.length === 0) return null;
 */
export function useActiveAds(location: AdLocation) {
    const toast = useToast();
    const { loading, data } = useAsyncEffect(
        () => getActiveAds(location),
        [location],
        { onError: () => toast.error('广告加载失败') },
    );
    return { loading, ads: data ?? [] };
}
