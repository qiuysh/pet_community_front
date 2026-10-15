import { getTopicCategories, getTagCloud } from '../api/discovery';
import { useAsyncEffect } from './useAsync';
import { TopicCategoryInfo, TagCloudItem } from '../types/discovery';

/**
 * 话题广场 hook
 *
 * 并行加载话题分类 + 热门标签云。
 *
 * 用法:
 *   const { loading, categories, tags } = useTopicSquare();
 */
export function useTopicSquare() {
  const { loading, data } = useAsyncEffect(
    async () => {
      const [cats, cloud] = await Promise.all([getTopicCategories(), getTagCloud()]);
      return { categories: cats, tags: cloud.tags };
    },
    [],
    { onError: (err) => console.error('加载话题广场失败', err) },
  );

  const categories: TopicCategoryInfo[] = data?.categories ?? [];
  const tags: TagCloudItem[] = data?.tags ?? [];

  return { loading, categories, tags };
}
