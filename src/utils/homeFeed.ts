import type { RecommendPostInfo, RecommendResponse } from '../types/discovery';
import type { PostInfo, PostListResponse } from '../types/post';

/** 推荐流条目 → 首页卡片 PostInfo（缺省字段用列表安全默认值） */
export function recommendPostToPostInfo(item: RecommendPostInfo): PostInfo {
  return {
    id: item.id,
    userId: item.userId,
    userNickname: item.userNickname,
    userAvatar: item.userAvatar,
    content: item.content,
    images: item.images,
    video: item.video,
    location: item.location,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    visibility: 0,
    likesCount: item.likesCount,
    commentsCount: item.commentsCount,
    sharesCount: item.sharesCount,
    favoritesCount: 0,
    isPinned: item.isPinned,
    isFeatured: item.isFeatured,
    isLiked: item.isLiked,
    isFavorited: item.isFavorited,
    status: 1,
    createdAt: item.createdAt,
  };
}

/** 首页 HomeFeed：Discovery 推荐响应 → 列表页消费的 PostListResponse */
export function recommendToPostListResponse(res: RecommendResponse): PostListResponse {
  return {
    list: (res.list || []).map(recommendPostToPostInfo),
    total: res.total ?? 0,
    page: res.page ?? 1,
    pageSize: res.pageSize ?? 20,
  };
}
