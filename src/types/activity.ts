// 活动类型枚举
export enum ActivityType {
  ONLINE_VOTE = 'online_vote',        // 线上投票活动
  OFFLINE_EVENT = 'offline_event',    // 线下活动
  ADOPTION = 'adoption',              // 领养活动
}

// 活动状态枚举
export enum ActivityStatus {
  DRAFT = 0,        // 草稿
  PUBLISHED = 1,    // 已发布
  ONGOING = 2,      // 进行中
  ENDED = 3,        // 已结束
  CANCELLED = 4,    // 已取消
}

// 报名状态枚举
export enum RegistrationStatus {
  PENDING = 0,      // 待审核
  APPROVED = 1,     // 已通过
  REJECTED = 2,     // 已拒绝
}

// 作品状态枚举
export enum SubmissionStatus {
  PENDING = 0,      // 待审核
  APPROVED = 1,     // 已通过
  REJECTED = 2,     // 已拒绝
}

// 活动信息接口
export interface ActivityInfo {
  id: number;
  title: string;
  description: string;
  type: ActivityType;
  cover: string;
  images?: string[];
  startTime: string;
  endTime: string;
  registrationDeadline?: string;
  voteStartTime?: string;
  voteEndTime?: string;
  maxParticipants?: number;
  currentParticipants: number;
  maxVotesPerUser?: number;
  status: ActivityStatus;
  rules?: string;
  prizes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  organizerId: number;
  organizerName: string;
  organizerAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
  isSubmitted?: boolean;
  hasVoted?: boolean;
}

// 活动创建请求
export interface ActivityCreateRequest {
  title: string;
  description: string;
  type: ActivityType;
  cover: string;
  images?: string[];
  startTime: string;
  endTime: string;
  registrationDeadline?: string;
  voteStartTime?: string;
  voteEndTime?: string;
  maxParticipants?: number;
  maxVotesPerUser?: number;
  rules?: string;
  prizes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: ActivityStatus;
}

// 活动更新请求
export interface ActivityUpdateRequest extends Partial<ActivityCreateRequest> {}

// 活动列表查询参数
export interface ActivityListParams {
  type?: ActivityType;
  status?: ActivityStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 活动列表响应
export interface ActivityListResponse {
  list: ActivityInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 报名信息接口
export interface RegistrationInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  images?: string[];
  status: RegistrationStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// 报名创建请求
export interface RegistrationCreateRequest {
  activityId: number;
  content: string;
  images?: string[];
}

// 报名更新请求
export interface RegistrationUpdateRequest {
  content?: string;
  images?: string[];
}

// 报名列表查询参数
export interface RegistrationListParams {
  activityId: number;
  status?: RegistrationStatus;
  page?: number;
  pageSize?: number;
}

// 报名列表响应
export interface RegistrationListResponse {
  list: RegistrationInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 作品信息接口
export interface SubmissionInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  title: string;
  description: string;
  images: string[];
  video?: string;
  votesCount: number;
  rank?: number;
  award?: string;
  isAwarded?: boolean;
  awardLevel?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
}

// 作品创建请求
export interface SubmissionCreateRequest {
  activityId: number;
  title: string;
  description: string;
  images: string[];
  video?: string;
}

// 作品更新请求
export interface SubmissionUpdateRequest {
  title?: string;
  description?: string;
  images?: string[];
  video?: string;
}

// 作品列表查询参数
export interface SubmissionListParams {
  activityId: number;
  status?: SubmissionStatus;
  sort?: 'votes' | 'time';
  page?: number;
  pageSize?: number;
}

// 作品列表响应
export interface SubmissionListResponse {
  list: SubmissionInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 投票请求
export interface VoteRequest {
  activityId: number;
  submissionId: number;
}

// 投票响应
export interface VoteResponse {
  voted: boolean;
  votesCount: number;
  remainingVotes: number;
  dailyLimit?: number;
  hourlyLimit?: number;
  sameSubmissionLimit?: number;
}

// 投票记录接口
export interface VoteRecord {
  id: number;
  activityId: number;
  submissionId: number;
  submissionTitle: string;
  submissionCover: string;
  userId: number;
  createdAt: string;
}

// 获奖设置请求
export interface AwardRequest {
  submissionId: number;
  award: string;
  rank: number;
}

// 批量获奖设置请求
export interface BatchAwardRequest {
  awards: AwardRequest[];
}

// 评选页面响应
export interface AwardPageResponse {
  activity: ActivityInfo;
  submissions: SubmissionInfo[];
  total: number;
  awardedCount: number;
  firstPrize?: SubmissionInfo;
  secondPrizes?: SubmissionInfo[];
  thirdPrizes?: SubmissionInfo[];
}

// 发布结果请求
export interface PublishAwardRequest {
  activityId: number;
}

// 发布结果响应
export interface PublishAwardResponse {
  success: boolean;
  message: string;
  notifiedUsers: number[];
}

// 活动统计信息
export interface ActivityStats {
  totalActivities: number;
  ongoingActivities: number;
  totalRegistrations: number;
  totalSubmissions: number;
  totalVotes: number;
}

// 活动类型选项
export const ActivityTypeOptions = [
  { value: ActivityType.ONLINE_VOTE, label: '线上投票活动' },
  { value: ActivityType.OFFLINE_EVENT, label: '线下活动' },
  { value: ActivityType.ADOPTION, label: '领养活动' },
];

// 活动状态选项
export const ActivityStatusOptions = [
  { value: ActivityStatus.DRAFT, label: '草稿', color: 'default' },
  { value: ActivityStatus.PUBLISHED, label: '已发布', color: 'blue' },
  { value: ActivityStatus.ONGOING, label: '进行中', color: 'green' },
  { value: ActivityStatus.ENDED, label: '已结束', color: 'gray' },
  { value: ActivityStatus.CANCELLED, label: '已取消', color: 'red' },
];

// 报名状态选项
export const RegistrationStatusOptions = [
  { value: RegistrationStatus.PENDING, label: '待审核', color: 'orange' },
  { value: RegistrationStatus.APPROVED, label: '已通过', color: 'green' },
  { value: RegistrationStatus.REJECTED, label: '已拒绝', color: 'red' },
];

// 作品状态选项
export const SubmissionStatusOptions = [
  { value: SubmissionStatus.PENDING, label: '待审核', color: 'orange' },
  { value: SubmissionStatus.APPROVED, label: '已通过', color: 'green' },
  { value: SubmissionStatus.REJECTED, label: '已拒绝', color: 'red' },
];

// ========== 签到相关类型 ==========

// 签到信息接口
export interface SignInInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  signInTime: string;
  signInLocation?: string;
  createdAt: string;
}

// 二维码响应接口
export interface QRCodeResponse {
  qrCode: string;     // 二维码内容
  imageUrl?: string;  // 二维码图片URL（base64格式）
  expires: string;    // 过期时间
}

// 签到请求接口
export interface SignInRequest {
  activityId: number;
  qrCode: string;
  signInLocation?: string;
}

// 签到列表响应接口
export interface SignInListResponse {
  list: SignInInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 签到统计响应接口
export interface SignInStatsResponse {
  signInCount: number;
  registrationCount: number;
}

// ========== 相册相关类型 ==========

// 相册照片信息接口
export interface AlbumPhotoInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  photoUrl: string;
  description?: string;
  status: number;
  createdAt: string;
}

// 相册照片创建请求接口
export interface AlbumPhotoCreateRequest {
  activityId: number;
  photoUrl: string;
  description?: string;
}

// 相册照片列表响应接口
export interface AlbumPhotoListResponse {
  list: AlbumPhotoInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// ========== 活动回顾相关类型 ==========

// 活动回顾信息接口
export interface ActivityReviewInfo {
  id: number;
  activityId: number;
  title: string;
  content: string;
  photos?: string[];
  publishedAt: string;
  publishedBy: number;
  createdAt: string;
}

// 活动回顾创建请求接口
export interface ActivityReviewCreateRequest {
  activityId: number;
  title: string;
  content: string;
  photos?: string[];
}