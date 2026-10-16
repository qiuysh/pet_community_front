import { get, post, put, del } from './axios';
import {
  ActivityInfo,
  ActivityCreateRequest,
  ActivityUpdateRequest,
  ActivityListParams,
  ActivityListResponse,
  RegistrationInfo,
  RegistrationCreateRequest,
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

function listQuery(params?: ActivityListParams) {
  if (!params) return undefined;
  const { pageSize, ...rest } = params;
  return {
    ...rest,
    page_size: pageSize,
  };
}

// ========== 活动相关 API ==========

/** 前台活动列表（不含草稿） */
export const getActivityList = async (params?: ActivityListParams): Promise<ActivityListResponse> => {
  return await get<ActivityListResponse>('/api/v1/activities', { params: listQuery(params) });
};

/** 管理端活动列表（含草稿，走 admin token） */
export const getAdminActivityList = async (params?: ActivityListParams): Promise<ActivityListResponse> => {
  return await get<ActivityListResponse>('/api/v1/admin/activities', { params: listQuery(params) });
};

export const getActivityDetail = async (id: number): Promise<ActivityInfo> => {
  return await get<ActivityInfo>(`/api/v1/activities/${id}`);
};

export const createActivity = async (data: ActivityCreateRequest): Promise<ActivityInfo> => {
  return await post<ActivityInfo>('/api/v1/admin/activities', data);
};

export const updateActivity = async (id: number, data: ActivityUpdateRequest): Promise<ActivityInfo> => {
  return await put<ActivityInfo>(`/api/v1/admin/activities/${id}`, data);
};

export const deleteActivity = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/admin/activities/${id}`);
};

export const publishActivity = async (id: number): Promise<void> => {
  return await post<void>(`/api/v1/admin/activities/${id}/publish`);
};

export const getActivityStats = async (): Promise<ActivityStats> => {
  return await get<ActivityStats>('/api/v1/activities/stats');
};

// ========== 报名相关 API ==========

/** 管理端报名列表 */
export const getRegistrationList = async (params: RegistrationListParams): Promise<RegistrationListResponse> => {
  const { activityId, pageSize, status, page } = params;
  return await get<RegistrationListResponse>(`/api/v1/admin/activities/${activityId}/registrations`, {
    params: {
      status: status ?? -1,
      page,
      page_size: pageSize,
    },
  });
};

export const createRegistration = async (data: RegistrationCreateRequest): Promise<RegistrationInfo> => {
  const { activityId, ...rest } = data;
  return await post<RegistrationInfo>(`/api/v1/activities/${activityId}/register`, {
    activityId,
    ...rest,
  });
};

export const cancelRegistration = async (activityId: number): Promise<void> => {
  return await post<void>(`/api/v1/activities/${activityId}/cancel`);
};

/** 管理端审核报名 */
export const reviewRegistration = async (registrationId: number, approve: boolean): Promise<void> => {
  return await post<void>(
    `/api/v1/admin/activities/registrations/${registrationId}/approve?approve=${approve ? 'true' : 'false'}`,
  );
};

// ========== 作品相关 API ==========

export const getSubmissionList = async (params: SubmissionListParams): Promise<SubmissionListResponse> => {
  const { activityId, pageSize, ...rest } = params;
  return await get<SubmissionListResponse>(`/api/v1/activities/${activityId}/submissions`, {
    params: { ...rest, page_size: pageSize },
  });
};

export const getSubmissionDetail = async (id: number): Promise<SubmissionInfo> => {
  return await get<SubmissionInfo>(`/api/v1/activities/submissions/${id}`);
};

export const createSubmission = async (data: SubmissionCreateRequest): Promise<SubmissionInfo> => {
  return await post<SubmissionInfo>('/api/v1/activities/submissions', data);
};

export const updateSubmission = async (id: number, data: SubmissionUpdateRequest): Promise<SubmissionInfo> => {
  return await put<SubmissionInfo>(`/api/v1/activities/submissions/${id}`, data);
};

export const deleteSubmission = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/activities/submissions/${id}`);
};

// ========== 投票相关 API ==========

export const voteForSubmission = async (data: VoteRequest): Promise<VoteResponse> => {
  return await post<VoteResponse>('/api/v1/activities/vote', data);
};

export const cancelVote = async (submissionId: number): Promise<void> => {
  return await post<void>(`/api/v1/activities/submissions/${submissionId}/cancel-vote`);
};

export const getVoteHistory = async (
  activityId: number,
  page = 1,
  pageSize = 20,
): Promise<{ list: VoteRecord[]; total: number }> => {
  return await get<{ list: VoteRecord[]; total: number }>(`/api/v1/activities/${activityId}/votes/history`, {
    params: { page, page_size: pageSize },
  });
};

// ========== 获奖设置 API（管理员） ==========

export const getAwardPage = async (activityId: number): Promise<AwardPageResponse> => {
  return await get<AwardPageResponse>(`/api/v1/admin/activities/${activityId}/award`);
};

export const setAward = async (data: AwardRequest): Promise<void> => {
  return await post<void>('/api/v1/admin/activities/submissions/award', data);
};

export const batchSetAward = async (data: BatchAwardRequest): Promise<void> => {
  return await post<void>('/api/v1/admin/activities/submissions/batch-award', data);
};

export const publishAwards = async (activityId: number): Promise<PublishAwardResponse> => {
  return await post<PublishAwardResponse>(`/api/v1/admin/activities/${activityId}/publish-award`);
};

// ========== 签到相关 API ==========

export const generateQRCode = async (activityId: number): Promise<QRCodeResponse> => {
  return await get<QRCodeResponse>(`/api/v1/activities/${activityId}/qrcode`);
};

export const signIn = async (activityId: number, data: SignInRequest): Promise<SignInInfo> => {
  return await post<SignInInfo>(`/api/v1/activities/${activityId}/sign-in`, data);
};

export const getSignInList = async (
  activityId: number,
  page = 1,
  pageSize = 20,
): Promise<SignInListResponse> => {
  return await get<SignInListResponse>(`/api/v1/admin/activities/${activityId}/sign-ins`, {
    params: { page, page_size: pageSize },
  });
};

export const getSignInStats = async (activityId: number): Promise<SignInStatsResponse> => {
  return await get<SignInStatsResponse>(`/api/v1/admin/activities/${activityId}/sign-ins/stats`);
};

// ========== 相册相关 API ==========

export const uploadAlbumPhoto = async (
  activityId: number,
  data: Omit<AlbumPhotoCreateRequest, 'activityId'> | AlbumPhotoCreateRequest,
): Promise<AlbumPhotoInfo> => {
  const payload = 'activityId' in data ? data : { activityId, ...data };
  return await post<AlbumPhotoInfo>(`/api/v1/activities/${activityId}/album/photos`, payload);
};

export const deleteAlbumPhoto = async (activityId: number, photoId: number): Promise<void> => {
  return await del<void>(`/api/v1/admin/activities/${activityId}/album/photos/${photoId}`);
};

export const getAlbumPhotoList = async (
  activityId: number,
  status?: number,
  page = 1,
  pageSize = 20,
): Promise<AlbumPhotoListResponse> => {
  return await get<AlbumPhotoListResponse>(`/api/v1/activities/${activityId}/album`, {
    params: { status, page, page_size: pageSize },
  });
};

// ========== 活动回顾相关 API ==========

export const publishReview = async (
  activityId: number,
  data: Omit<ActivityReviewCreateRequest, 'activityId'> | ActivityReviewCreateRequest,
): Promise<ActivityReviewInfo> => {
  const payload = 'activityId' in data ? data : { activityId, ...data };
  return await post<ActivityReviewInfo>(`/api/v1/admin/activities/${activityId}/review`, payload);
};

export const getReview = async (activityId: number): Promise<ActivityReviewInfo> => {
  return await get<ActivityReviewInfo>(`/api/v1/activities/${activityId}/review`);
};
