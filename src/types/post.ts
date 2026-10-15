export interface TopicInfo {
  id: number;
  name: string;
  description: string;
  cover: string;
  postsCount: number;
  status: number;
}

export interface PostInfo {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  images?: string[];
  video?: string;
  petIds?: number[];
  topicIds?: number[];
  topics?: TopicInfo[];
  pets?: { id: number; userId: number; name: string; avatar: string }[];
  location?: string;
  visibility: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  favoritesCount: number;
  isPinned: number;
  isFeatured: number;
  isLiked: boolean;
  isFavorited: boolean;
  status: number;
  publishAt?: string;
  createdAt: string;
}

export interface PostCreateRequest {
  content?: string;
  images?: string[];
  video?: string;
  petIds?: number[];
  topicIds?: number[];
  location?: string;
  visibility?: number;
  atUsers?: number[];
  publishAt?: string;
}

export interface PostUpdateRequest {
  content?: string;
  images?: string[];
  petIds?: number[];
  topicIds?: number[];
  location?: string;
  visibility?: number;
  atUsers?: number[];
  publishAt?: string;
}

export interface PostListParams {
  userId?: number;
  petId?: number;
  topicId?: number;
  type?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface PostListResponse {
  list: PostInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CommentInfo {
  id: number;
  postId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  parentId: number;
  replyToId?: number;
  replyToName?: string;
  content: string;
  atUsers?: number[];
  likesCount: number;
  isLiked: boolean;
  children?: CommentInfo[];
  status: number;
  createdAt: string;
}

export interface CommentCreateRequest {
  postId: number;
  parentId?: number;
  replyToId?: number;
  content: string;
  atUsers?: number[];
}

export interface CommentUpdateRequest {
  content: string;
}

export interface CommentListParams {
  postId: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface CommentListResponse {
  list: CommentInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DraftInfo {
  id: number;
  userId: number;
  content: string;
  images?: string[];
  video?: string;
  petIds?: number[];
  topicIds?: number[];
  location?: string;
  visibility: number;
  createdAt: string;
  updatedAt: string;
}

export interface DraftCreateRequest {
  content?: string;
  images?: string[];
  video?: string;
  petIds?: number[];
  topicIds?: number[];
  location?: string;
  visibility?: number;
}

export interface DraftListResponse {
  list: DraftInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportInfo {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  reasonType: string;
  status: number;
  handleResult?: string;
  handledAt?: string;
  createdAt: string;
}

export interface ReportCreateRequest {
  targetType: string;
  targetId: number;
  reason: string;
  reasonType: string;
}

export interface ReportListResponse {
  list: ReportInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LikeResult {
  liked: boolean;
  likesCount: number;
}

export interface FavoriteResult {
  favorited: boolean;
  favoritesCount: number;
}

export interface ShareRequest {
  platform?: string;
}

export const VisibilityOptions = [
  { value: 0, label: '公开', desc: '所有人可见' },
  { value: 1, label: '仅粉丝', desc: '仅粉丝可见' },
  { value: 2, label: '私密', desc: '仅自己可见' },
];

export const ReportReasonOptions = [
  { value: 'spam', label: '垃圾广告' },
  { value: 'adult', label: '色情低俗' },
  { value: 'attack', label: '人身攻击' },
  { value: 'other', label: '其他原因' },
];
