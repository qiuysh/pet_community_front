import { get, post, del } from './axios';
import {
  SearchResult,
  SearchHistoryInfo,
  HotKeywordInfo,
  RecommendResponse,
  CategoryPostResponse,
  TagCloudResponse,
  RankingResponse,
  TopicCategoryInfo,
  TopicDetailInfo,
  TopicCreateRequest,
} from '../types/discovery';

export const search = async (keyword: string): Promise<SearchResult> => {
  return await get<SearchResult>('/api/v1/search', { params: { keyword } });
};

export const getSearchHistory = async (limit = 10): Promise<SearchHistoryInfo[]> => {
  return await get<SearchHistoryInfo[]>('/api/v1/search/history', { params: { limit } });
};

export const deleteSearchHistory = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/search/history/${id}`);
};

export const clearSearchHistory = async (): Promise<void> => {
  return await del<void>('/api/v1/search/history');
};

export const getHotKeywords = async (limit = 10): Promise<HotKeywordInfo[]> => {
  return await get<HotKeywordInfo[]>('/api/v1/search/hot-keywords', { params: { limit } });
};

export const getRecommendPosts = async (
  page = 1,
  pageSize = 20,
  postType?: string
): Promise<RecommendResponse> => {
  const params: Record<string, string | number> = { page, pageSize };
  if (postType) params.type = postType;
  return await get<RecommendResponse>('/api/v1/recommend', { params });
};

export const getCategoryPosts = async (
  params: {
    categoryId?: number;
    petType?: string;
    postType?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<CategoryPostResponse> => {
  return await get<CategoryPostResponse>('/api/v1/category', { params });
};

export const getTagCloud = async (): Promise<TagCloudResponse> => {
  return await get<TagCloudResponse>('/api/v1/category/tag-cloud');
};

export const getHotRanking = async (period = 'day'): Promise<RankingResponse> => {
  return await get<RankingResponse>('/api/v1/ranking', { params: { period } });
};

export const getTopicCategories = async (): Promise<TopicCategoryInfo[]> => {
  return await get<TopicCategoryInfo[]>('/api/v1/topics/categories');
};

export const getTopicDetail = async (id: number): Promise<TopicDetailInfo> => {
  return await get<TopicDetailInfo>(`/api/v1/topics/${id}/detail`);
};

export const getTopicPosts = async (id: number, page = 1, pageSize = 20): Promise<CategoryPostResponse> => {
  return await get<CategoryPostResponse>(`/api/v1/topics/${id}/posts`, { params: { page, pageSize } });
};

export const participateTopic = async (id: number): Promise<void> => {
  return await post<void>(`/api/v1/topics/${id}/participate`);
};

export const createTopic = async (data: TopicCreateRequest): Promise<TopicDetailInfo> => {
  return await post<TopicDetailInfo>('/api/v1/topics', data);
};

export const shareTopic = async (id: number, platform?: string): Promise<{ shareUrl: string; qrCode?: string }> => {
  const params: Record<string, string> = {};
  if (platform) params.platform = platform;
  return await get<{ shareUrl: string; qrCode?: string }>(`/api/v1/topics/${id}/share`, { params });
};