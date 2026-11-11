/** 与后端 types.ActivityCreateRequest oneof / DB activity_types 对齐 */
export enum ActivityType {
  ONLINE_VOTE = 'online_vote',
  ONLINE_COLLECT = 'online_collect',
  OFFLINE_MEET = 'offline_meet',
  ADOPT = 'adopt',
  /** @deprecated 历史创建值，等同 online_vote */
  VOTING = 'voting',
  /** @deprecated 历史创建值 */
  CONTEST = 'contest',
  /** @deprecated 历史创建值，等同 online_collect */
  COLLECTION = 'collection',
}

/** 与后端 activities.status 对齐：0 草稿，1 已发布 */
export enum ActivityStatus {
  DRAFT = 0,
  PUBLISHED = 1,
}

/** 前台/管理列表 status 查询（仓库字符串筛选） */
export type ActivityListStatusFilter = 'active' | 'upcoming' | 'ended' | 'draft' | 'published';

export enum RegistrationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export enum SubmissionStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export interface ActivityInfo {
  id: number;
  title: string;
  description: string;
  type: ActivityType | string;
  cover: string;
  status: ActivityStatus | number;
  startTime: string;
  endTime: string;
  rules?: string;
  prizes?: string;
  maxParticipants?: number;
  maxSubmissions?: number;
  votesPerDay?: number;
  requireApproval?: boolean;
  createdAt: string;
  updatedAt: string;
  participantsCount: number;
  submissionsCount: number;
  isRegistered?: boolean;
  hasSubmitted?: boolean;
}

export interface ActivityCreateRequest {
  title: string;
  description: string;
  type: ActivityType | string;
  cover?: string;
  startTime: string;
  endTime: string;
  rules?: string;
  prizes?: string;
  maxParticipants?: number;
  maxSubmissions?: number;
  votesPerDay?: number;
  requireApproval?: boolean;
}

export interface ActivityUpdateRequest {
  title?: string;
  description?: string;
  cover?: string;
  startTime?: string;
  endTime?: string;
  rules?: string;
  prizes?: string;
  maxParticipants?: number;
  maxSubmissions?: number;
  votesPerDay?: number;
  requireApproval?: boolean;
}

export interface ActivityListParams {
  type?: ActivityType | string;
  status?: ActivityListStatusFilter;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityListResponse {
  list: ActivityInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RegistrationInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  status: RegistrationStatus | number;
  name: string;
  phone: string;
  message?: string;
  createdAt: string;
}

export interface RegistrationCreateRequest {
  activityId: number;
  name: string;
  phone: string;
  message?: string;
}

export interface RegistrationUpdateRequest {
  name?: string;
  phone?: string;
  message?: string;
}

export interface RegistrationListParams {
  activityId: number;
  status?: RegistrationStatus | number;
  page?: number;
  pageSize?: number;
}

export interface RegistrationListResponse {
  list: RegistrationInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmissionInfo {
  id: number;
  activityId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  title: string;
  description: string;
  type?: string;
  content?: string;
  images?: string[];
  video?: string;
  votesCount: number;
  rank?: number;
  isAwarded?: boolean;
  awardLevel?: string;
  status: SubmissionStatus | number;
  createdAt: string;
  updatedAt: string;
  isVoted?: boolean;
}

export interface SubmissionCreateRequest {
  activityId: number;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'text';
  content?: string;
  images?: string[];
  video?: string;
}

export interface SubmissionUpdateRequest {
  title?: string;
  description?: string;
  content?: string;
  images?: string[];
  video?: string;
}

export interface SubmissionListParams {
  activityId: number;
  sort?: 'votes' | 'time';
  page?: number;
  pageSize?: number;
}

export interface SubmissionListResponse {
  list: SubmissionInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VoteRequest {
  activityId: number;
  submissionId: number;
}

export interface VoteResponse {
  voted: boolean;
  votesCount: number;
  remainingVotes: number;
}

export interface VoteRecord {
  id: number;
  userId: number;
  activityId: number;
  submissionId: number;
  createdAt: string;
}

export interface AwardRequest {
  submissionId: number;
  awardLevel: 'first' | 'second' | 'third';
}

export interface BatchAwardRequest {
  awards: AwardRequest[];
}

export interface AwardPageResponse {
  activity: ActivityInfo;
  submissions: SubmissionInfo[];
  total: number;
  awardedCount: number;
  firstPrize?: SubmissionInfo;
  secondPrizes?: SubmissionInfo[];
  thirdPrizes?: SubmissionInfo[];
}

export interface PublishAwardResponse {
  success: boolean;
  message: string;
  notifiedUsers: number[];
}

export const ActivityTypeOptions = [
  { value: ActivityType.ONLINE_VOTE, label: '投票评选' },
  { value: ActivityType.ONLINE_COLLECT, label: '话题征集' },
  { value: ActivityType.OFFLINE_MEET, label: '线下活动' },
  { value: ActivityType.ADOPT, label: '领养活动' },
  // 历史值仍可展示标签（列表里旧数据）
  { value: ActivityType.VOTING, label: '投票评选' },
  { value: ActivityType.CONTEST, label: '作品征集' },
  { value: ActivityType.COLLECTION, label: '话题征集' },
];

/** 后台新建可选类型（不含历史别名，避免继续写入漂移值） */
export const ActivityTypeCreateOptions = [
  { value: ActivityType.ONLINE_VOTE, label: '投票评选' },
  { value: ActivityType.ONLINE_COLLECT, label: '话题征集' },
  { value: ActivityType.OFFLINE_MEET, label: '线下活动' },
  { value: ActivityType.ADOPT, label: '领养活动' },
];

/** 投票/征集类：可投稿与作品展示（含历史别名） */
export function isSubmissionActivityType(type: string): boolean {
  return (
    type === ActivityType.ONLINE_VOTE ||
    type === ActivityType.VOTING ||
    type === ActivityType.CONTEST
  );
}

export function isOfflineMeetActivityType(type: string): boolean {
  return type === ActivityType.OFFLINE_MEET;
}

export const ActivityStatusOptions = [
  { value: ActivityStatus.DRAFT, label: '草稿', color: 'default' },
  { value: ActivityStatus.PUBLISHED, label: '已发布', color: 'blue' },
];

export const RegistrationStatusOptions = [
  { value: RegistrationStatus.PENDING, label: '待审核', color: 'orange' },
  { value: RegistrationStatus.APPROVED, label: '已通过', color: 'green' },
  { value: RegistrationStatus.REJECTED, label: '已拒绝', color: 'red' },
];

export const SubmissionStatusOptions = [
  { value: SubmissionStatus.PENDING, label: '待审核', color: 'orange' },
  { value: SubmissionStatus.APPROVED, label: '已通过', color: 'green' },
  { value: SubmissionStatus.REJECTED, label: '已拒绝', color: 'red' },
];

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

export interface QRCodeResponse {
  qrCode: string;
  expires: string;
}

export interface SignInRequest {
  activityId: number;
  qrCode: string;
  signInLocation?: string;
}

export interface SignInListResponse {
  list: SignInInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SignInStatsResponse {
  signInCount: number;
  registrationCount: number;
}

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

export interface AlbumPhotoCreateRequest {
  activityId: number;
  photoUrl: string;
  description?: string;
}

export interface AlbumPhotoListResponse {
  list: AlbumPhotoInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActivityReviewInfo {
  id: number;
  activityId: number;
  title: string;
  content: string;
  photos?: string[];
  publishedAt?: string;
  publishedBy?: number;
  createdAt: string;
}

export interface ActivityReviewCreateRequest {
  activityId: number;
  title: string;
  content: string;
  photos?: string[];
}

/** 根据发布时间与起止时间推导展示态 */
export function getActivityDisplayStatus(
  activity: Pick<ActivityInfo, 'status' | 'startTime' | 'endTime'>,
): 'draft' | 'upcoming' | 'active' | 'ended' {
  if (activity.status === ActivityStatus.DRAFT) return 'draft';
  const now = Date.now();
  const start = new Date(activity.startTime).getTime();
  const end = new Date(activity.endTime).getTime();
  if (!Number.isNaN(start) && now < start) return 'upcoming';
  if (!Number.isNaN(end) && now > end) return 'ended';
  return 'active';
}
