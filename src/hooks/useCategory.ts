import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryPosts, getTopicCategories } from '../api/discovery';
import { useAsyncEffect } from './useAsync';
import { TopicCategoryInfo, RecommendPostInfo } from '../types/discovery';

export type CategorySortType = 'latest' | 'hot';

/**
 * 分类浏览 hook
 *
 * 管理:
 * - 当前分类信息(根据路由 id 从 categories 查找)
 * - 宠物类型 / 帖子类型 / 排序方式筛选
 * - 分页加载分类帖子
 *
 * 用法:
 *   const { categoryInfo, loading, posts, total, page, setPage, petType, setPetType, postType, setPostType, sortType, setSortType } = useCategory();
 */
export function useCategory(pageSize = 10) {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [petType, setPetType] = useState('');
  const [postType, setPostType] = useState('');
  const [sortType, setSortType] = useState<CategorySortType>('latest');

  // 加载分类信息
  const { data: categoryData } = useAsyncEffect(
    async () => {
      if (!id) return null;
      const cats = await getTopicCategories();
      return cats.find((c) => String(c.id) === id) || null;
    },
    [id],
    { initialData: null },
  );
  const categoryInfo: TopicCategoryInfo | null = categoryData ?? null;

  // 加载分类帖子（含路由 categoryId）
  const categoryId = id ? Number(id) : undefined;
  const { loading, data: postsData } = useAsyncEffect(
    () => getCategoryPosts({
      categoryId: categoryId && !Number.isNaN(categoryId) ? categoryId : undefined,
      petType: petType || undefined,
      postType: postType || undefined,
      sort: sortType,
      page,
      pageSize,
    }),
    [page, petType, postType, sortType, categoryId],
    { onError: (err) => console.error('加载分类帖子失败', err) },
  );
  const posts: RecommendPostInfo[] = postsData?.list ?? [];
  const total: number = postsData?.total ?? 0;

  // 切换筛选条件时重置页码
  const handlePetTypeChange = (value: string) => {
    setPetType(value);
    setPage(1);
  };

  const handlePostTypeChange = (value: string) => {
    setPostType(value);
    setPage(1);
  };

  const handleSortChange = (value: CategorySortType) => {
    setSortType(value);
    setPage(1);
  };

  return {
    categoryInfo,
    loading,
    posts,
    total,
    page,
    setPage,
    petType,
    setPetType: handlePetTypeChange,
    postType,
    setPostType: handlePostTypeChange,
    sortType,
    setSortType: handleSortChange,
  };
}
