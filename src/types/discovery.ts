export interface SearchResult {
  users: UserSearchResult[];
  posts: PostSearchResult[];
  topics: TopicSearchResult[];
}

export interface UserSearchResult {
  id: number;
  nickname: string;
  avatar: string;
  followersCount: number;
}

export interface PostSearchResult {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  images?: string[];
  video?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface TopicSearchResult {
  id: number;
  name: string;
  description: string;
  cover: string;
  postsCount: number;
}

export interface SearchHistoryInfo {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

export interface HotKeywordInfo {
  id: number;
  keyword: string;
  searchCount: number;
  rank: number;
}

export interface TopicCategoryInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  status: number;
}

export interface TopicDetailInfo {
  id: number;
  name: string;
  description: string;
  cover: string;
  postsCount: number;
  status: number;
  participantsCount: number;
  isParticipated: boolean;
  createdAt: string;
}

export interface RecommendPostInfo {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  images?: string[];
  video?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned: number;
  isFeatured: number;
  isLiked: boolean;
  isFavorited: boolean;
  createdAt: string;
}

export interface RecommendResponse {
  list: RecommendPostInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RankingPost {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hotScore: number;
  createdAt: string;
}

export interface RankingUser {
  id: number;
  nickname: string;
  avatar: string;
  followersCount: number;
  postsCount: number;
  hotScore: number;
}

export interface RankingTopic {
  id: number;
  name: string;
  description: string;
  cover: string;
  postsCount: number;
  hotScore: number;
}

export interface RankingResponse {
  posts: RankingPost[];
  users: RankingUser[];
  topics: RankingTopic[];
}

export interface CategoryPostResponse {
  list: RecommendPostInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TagCloudItem {
  id: number;
  name: string;
  count: number;
  hot: number;
}

export interface TagCloudResponse {
  tags: TagCloudItem[];
}

export interface TopicCreateRequest {
  name: string;
  description?: string;
  cover?: string;
}