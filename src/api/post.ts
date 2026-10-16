import { get, post, put, del } from './axios';
import {
  PostInfo,
  PostCreateRequest,
  PostUpdateRequest,
  PostListParams,
  PostListResponse,
  CommentInfo,
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentListParams,
  CommentListResponse,
  TopicInfo,
  DraftInfo,
  DraftCreateRequest,
  DraftListResponse,
  ReportInfo,
  ReportCreateRequest,
  ReportListResponse,
  LikeResult,
  FavoriteResult,
  ShareRequest,
} from '../types/post';

export const getTopicList = async (keyword?: string, page = 1, pageSize = 20): Promise<{ list: TopicInfo[]; total: number; page: number; pageSize: number }> => {
  const params: Record<string, any> = { page, pageSize };
  if (keyword) params.keyword = keyword;
  return await get<{ list: TopicInfo[]; total: number; page: number; pageSize: number }>('/api/v1/topics', { params });
};

export const getTopicDetail = async (id: number): Promise<TopicInfo> => {
  return await get<TopicInfo>(`/api/v1/topics/${id}`);
};

export const searchTopics = async (keyword: string, limit = 10): Promise<TopicInfo[]> => {
  return await get<TopicInfo[]>('/api/v1/topics/search', { params: { keyword, limit } });
};

export const getPostList = async (params: PostListParams): Promise<PostListResponse> => {
  return await get<PostListResponse>('/api/v1/posts', { params });
};

export const getPostDetail = async (id: number): Promise<PostInfo> => {
  return await get<PostInfo>(`/api/v1/posts/${id}`);
};

export const createPost = async (data: PostCreateRequest): Promise<PostInfo> => {
  return await post<PostInfo>('/api/v1/posts', data);
};

export const updatePost = async (id: number, data: PostUpdateRequest): Promise<PostInfo> => {
  return await put<PostInfo>(`/api/v1/posts/${id}`, data);
};

export const deletePost = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/posts/${id}`);
};

/** 取消定时发布并转为草稿（D7-02） */
export const cancelPostSchedule = async (id: number): Promise<DraftInfo> => {
  return await post<DraftInfo>(`/api/v1/posts/${id}/cancel-schedule`);
};

export const togglePostLike = async (id: number): Promise<LikeResult> => {
  return await post<LikeResult>(`/api/v1/posts/${id}/like`);
};

export const togglePostFavorite = async (id: number): Promise<FavoriteResult> => {
  return await post<FavoriteResult>(`/api/v1/posts/${id}/favorite`);
};

export const recordPostShare = async (id: number, data: ShareRequest): Promise<void> => {
  return await post<void>(`/api/v1/posts/${id}/share`, data);
};

export const getPostComments = async (params: CommentListParams): Promise<CommentListResponse> => {
  const { postId, ...rest } = params;
  return await get<CommentListResponse>(`/api/v1/posts/${postId}/comments`, { params: rest });
};

export const createComment = async (data: CommentCreateRequest): Promise<CommentInfo> => {
  return await post<CommentInfo>(`/api/v1/posts/${data.postId}/comments`, data);
};

export const updateComment = async (id: number, data: CommentUpdateRequest): Promise<CommentInfo> => {
  return await put<CommentInfo>(`/api/v1/posts/comments/${id}`, data);
};

export const deleteComment = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/posts/comments/${id}`);
};

export const toggleCommentLike = async (id: number): Promise<LikeResult> => {
  return await post<LikeResult>(`/api/v1/posts/comments/${id}/like`);
};

export const getDraftList = async (page = 1, pageSize = 10): Promise<DraftListResponse> => {
  return await get<DraftListResponse>('/api/v1/drafts', { params: { page, pageSize } });
};

export const getDraftDetail = async (id: number): Promise<DraftInfo> => {
  return await get<DraftInfo>(`/api/v1/drafts/${id}`);
};

export const createDraft = async (data: DraftCreateRequest): Promise<DraftInfo> => {
  return await post<DraftInfo>('/api/v1/drafts', data);
};

export const updateDraft = async (id: number, data: DraftCreateRequest): Promise<DraftInfo> => {
  return await put<DraftInfo>(`/api/v1/drafts/${id}`, data);
};

export const deleteDraft = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/drafts/${id}`);
};

export const getMyFavorites = async (page = 1, pageSize = 10): Promise<PostListResponse> => {
  return await get<PostListResponse>('/api/v1/favorites', { params: { page, pageSize } });
};

export const getMyLikes = async (page = 1, pageSize = 10): Promise<PostListResponse> => {
  return await get<PostListResponse>('/api/v1/likes', { params: { page, pageSize } });
};

export const createReport = async (data: ReportCreateRequest): Promise<ReportInfo> => {
  return await post<ReportInfo>('/api/v1/posts/reports', data);
};

export const getReportList = async (page = 1, pageSize = 10): Promise<ReportListResponse> => {
  return await get<ReportListResponse>('/api/v1/posts/reports', { params: { page, pageSize } });
};

export const getReportDetail = async (id: number): Promise<ReportInfo> => {
  return await get<ReportInfo>(`/api/v1/posts/reports/${id}`);
};
