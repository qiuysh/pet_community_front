import { getTopicCategories, getTagCloud } from '../api/discovery';
import { getTopicList } from '../api/post';
import { useAsyncEffect } from './useAsync';
import { TopicCategoryInfo, TagCloudItem } from '../types/discovery';
import { TopicInfo } from '../types/post';

/**
 * 话题广场 hook
 *
 * 并行加载话题分类 + 热门标签云 + 热门话题列表。
 *
 * 用法:
 *   const { loading, categories, tags, hotTopics } = useTopicSquare();
 */
export function useTopicSquare() {
  const { loading, data } = useAsyncEffect(
    async () => {
      const [cats, cloud, topicPage] = await Promise.all([
        getTopicCategories(),
        getTagCloud(),
        getTopicList(undefined, 1, 10),
      ]);
      return { categories: cats, tags: cloud.tags, hotTopics: topicPage.list };
    },
    [],
    { onError: (err) => console.error('加载话题广场失败', err) },
  );

  const categories: TopicCategoryInfo[] = data?.categories ?? [];
  const tags: TagCloudItem[] = data?.tags ?? [];
  const hotTopics: TopicInfo[] = data?.hotTopics ?? [];

  return { loading, categories, tags, hotTopics };
}
