import { get, post, put, del } from './axios';
import {
  ActivityInfo,
  ActivityCreateRequest,
  ActivityUpdateRequest,
  ActivityListParams,
  ActivityListResponse,
  RegistrationInfo,
  RegistrationCreateRequest,
  RegistrationUpdateRequest,
  RegistrationListParams,
  RegistrationListResponse,
  SubmissionInfo,
  SubmissionCreateRequest,
  SubmissionUpdateRequest,
  SubmissionListParams,
  SubmissionListResponse,
  VoteRequest,
  VoteResponse,
  VoteRecord,
  AwardRequest,
  BatchAwardRequest,
  AwardPageResponse,
  PublishAwardResponse,
  ActivityStats,
  SignInInfo,
  QRCodeResponse,
  SignInRequest,
  SignInListResponse,
  SignInStatsResponse,
  AlbumPhotoInfo,
  AlbumPhotoCreateRequest,
  AlbumPhotoListResponse,
  ActivityReviewInfo,
  ActivityReviewCreateRequest,
} from '../types/activity';

// ========== 活动相关 API ==========

// 获取活动列表
export const getActivityList = async (params?: ActivityListParams): Promise<ActivityListResponse> => {
  return await get<ActivityListResponse>('/api/v1/activities', { params });
};

// 获取活动详情
export const getActivityDetail = async (id: number): Promise<ActivityInfo> => {
  return await get<ActivityInfo>(`/api/v1/activities/${id}`);
};

// 创建活动（管理员）
export const createActivity = async (data: ActivityCreateRequest): Promise<ActivityInfo> => {
  return await post<ActivityInfo>('/api/v1/activities', data);
};

// 更新活动（管理员）
export const updateActivity = async (id: number, data: ActivityUpdateRequest): Promise<ActivityInfo> => {
  return await put<ActivityInfo>(`/api/v1/activities/${id}`, data);
};

// 删除活动（管理员）
export const deleteActivity = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/activities/${id}`);
};

// 获取活动统计
export const getActivityStats = async (): Promise<ActivityStats> => {
  return await get<ActivityStats>('/api/v1/activities/stats');
};

// ========== 报名相关 API ==========

// 获取报名列表
export const getRegistrationList = async (params: RegistrationListParams): Promise<RegistrationListResponse> => {
  const { activityId, ...rest } = params;
  return await get<RegistrationListResponse>(`/api/v1/activities/${activityId}/registrations`, { params: rest });
};

// 获取报名详情
export const getRegistrationDetail = async (activityId: number, id: number): Promise<RegistrationInfo> => {
  return await get<RegistrationInfo>(`/api/v1/activities/${activityId}/registrations/${id}`);
};

// 创建报名
export const createRegistration = async (data: RegistrationCreateRequest): Promise<RegistrationInfo> => {
  const { activityId, ...rest } = data;
  return await post<RegistrationInfo>(`/api/v1/activities/${activityId}/registrations`, rest);
};

// 更新报名
export const updateRegistration = async (activityId: number, id: number, data: RegistrationUpdateRequest): Promise<RegistrationInfo> => {
  return await put<RegistrationInfo>(`/api/v1/activities/${activityId}/registrations/${id}`, data);
};

// 取消报名
export const cancelRegistration = async (activityId: number, id: number): Promise<void> => {
  return await del<void>(`/api/v1/activities/${activityId}/registrations/${id}`);
};

// 审核报名（管理员）
export const reviewRegistration = async (activityId: number, id: number, status: number, reason?: string): Promise<RegistrationInfo> => {
  return await put<RegistrationInfo>(`/api/v1/activities/${activityId}/registrations/${id}/review`, { status, reason });
};

// ========== 作品相关 API ==========

// 获取作品列表
export const getSubmissionList = async (params: SubmissionListParams): Promise<SubmissionListResponse> => {
  const { activityId, ...rest } = params;
  return await get<SubmissionListResponse>(`/api/v1/activities/${activityId}/submissions`, { params: rest });
};

// 获取作品详情
export const getSubmissionDetail = async (activityId: number, id: number): Promise<SubmissionInfo> => {
  return await get<SubmissionInfo>(`/api/v1/activities/${activityId}/submissions/${id}`);
};

// 创建作品
export const createSubmission = async (data: SubmissionCreateRequest): Promise<SubmissionInfo> => {
  const { activityId, ...rest } = data;
  return await post<SubmissionInfo>(`/api/v1/activities/${activityId}/submissions`, rest);
};

// 更新作品
export const updateSubmission = async (activityId: number, id: number, data: SubmissionUpdateRequest): Promise<SubmissionInfo> => {
  return await put<SubmissionInfo>(`/api/v1/activities/${activityId}/submissions/${id}`, data);
};

// 删除作品
export const deleteSubmission = async (activityId: number, id: number): Promise<void> => {
  return await del<void>(`/api/v1/activities/${activityId}/submissions/${id}`);
};

// 审核作品（管理员）
export const reviewSubmission = async (activityId: number, id: number, status: number, reason?: string): Promise<SubmissionInfo> => {
  return await put<SubmissionInfo>(`/api/v1/activities/${activityId}/submissions/${id}/review`, { status, reason });
};

// ========== 投票相关 API ==========

// 为作品投票
export const voteForSubmission = async (data: VoteRequest): Promise<VoteResponse> => {
  const { activityId, submissionId } = data;
  return await post<VoteResponse>(`/api/v1/activities/${activityId}/submissions/${submissionId}/vote`);
};

// 撤销投票
export const cancelVote = async (activityId: number, submissionId: number): Promise<VoteResponse> => {
  return await del<VoteResponse>(`/api/v1/activities/${activityId}/submissions/${submissionId}/vote`);
};

// 获取投票记录
export const getVoteHistory = async (activityId: number, page = 1, pageSize = 20): Promise<{ list: VoteRecord[]; total: number }> => {
  return await get<{ list: VoteRecord[]; total: number }>(`/api/v1/activities/${activityId}/votes`, { params: { page, pageSize } });
};

// ========== 获奖设置 API（管理员） ==========

// 获取评选页面数据
export const getAwardPage = async (activityId: number): Promise<AwardPageResponse> => {
  return await get<AwardPageResponse>(`/api/v1/admin/activities/${activityId}/award`);
};

// 设置获奖
export const setAward = async (activityId: number, data: AwardRequest): Promise<SubmissionInfo> => {
  const { submissionId, ...rest } = data;
  return await put<SubmissionInfo>(`/api/v1/activities/${activityId}/submissions/${submissionId}/award`, rest);
};

// 批量设置获奖
export const batchSetAward = async (data: BatchAwardRequest): Promise<void> => {
  return await post<void>(`/api/v1/admin/activities/submissions/batch-award`, data);
};

// 公布获奖结果
export const publishAwards = async (activityId: number): Promise<PublishAwardResponse> => {
  return await post<PublishAwardResponse>(`/api/v1/admin/activities/${activityId}/publish-award`);
};

// ========== 签到相关 API ==========

// 生成签到二维码
export const generateQRCode = async (activityId: number): Promise<QRCodeResponse> => {
  return await get<QRCodeResponse>(`/api/v1/activities/${activityId}/qrcode`);
};

// 扫码签到
export const signIn = async (activityId: number, data: SignInRequest): Promise<SignInInfo> => {
  return await post<SignInInfo>(`/api/v1/activities/${activityId}/sign-in`, data);
};

// 获取签到列表
export const getSignInList = async (
  activityId: number,
  page = 1,
  pageSize = 20
): Promise<SignInListResponse> => {
  return await get<SignInListResponse>(`/api/v1/activities/${activityId}/sign-ins`, {
    params: { page, pageSize }
  });
};

// 获取签到统计
export const getSignInStats = async (activityId: number): Promise<SignInStatsResponse> => {
  return await get<SignInStatsResponse>(`/api/v1/activities/${activityId}/sign-ins/stats`);
};

// ========== 相册相关 API ==========

// 上传照片到相册
export const uploadAlbumPhoto = async (
  activityId: number,
  data: AlbumPhotoCreateRequest
): Promise<AlbumPhotoInfo> => {
  return await post<AlbumPhotoInfo>(`/api/v1/activities/${activityId}/album/photos`, data);
};

// 删除照片
export const deleteAlbumPhoto = async (activityId: number, photoId: number): Promise<void> => {
  return await del<void>(`/api/v1/activities/${activityId}/album/photos/${photoId}`);
};

// 获取照片列表
export const getAlbumPhotoList = async (
  activityId: number,
  status?: number,
  page = 1,
  pageSize = 20
): Promise<AlbumPhotoListResponse> => {
  return await get<AlbumPhotoListResponse>(`/api/v1/activities/${activityId}/album`, {
    params: { status, page, pageSize }
  });
};

// ========== 活动回顾相关 API ==========

// 发布活动回顾
export const publishReview = async (
  activityId: number,
  data: ActivityReviewCreateRequest
): Promise<ActivityReviewInfo> => {
  return await post<ActivityReviewInfo>(`/api/v1/admin/activities/${activityId}/review`, data);
};

// 获取活动回顾
export const getReview = async (activityId: number): Promise<ActivityReviewInfo> => {
  return await get<ActivityReviewInfo>(`/api/v1/activities/${activityId}/review`);
};