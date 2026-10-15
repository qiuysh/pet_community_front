import { get, post, put, del } from './axios';
import {
  AdoptInfo,
  AdoptCreateRequest,
  AdoptUpdateRequest,
  AdoptListParams,
  AdoptListResponse,
  AdoptionApplicationInfo,
  AdoptionApplicationRequest,
  AdoptionApplicationListParams,
  AdoptionApplicationListResponse,
  AdoptionReviewRequest,
  AdoptionAgreementRequest,
  AdoptionStatusUpdateRequest,
  AdoptionStats,
  AdoptionFollowUpRecord,
  AdoptionFollowUpRequest,
  AdoptionFollowUpListResponse,
} from '../types/adopt';

export interface UploadAdoptPhotoResponse {
  url: string;
}

// 上传领养照片（multipart/form-data, form field=file）
export const uploadAdoptPhoto = async (file: File): Promise<UploadAdoptPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UploadAdoptPhotoResponse>('/api/v1/adopts/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 强制绕过 axios transformRequest 对 FormData 的错误处理
    skipTransform: true,
  } as any);
};

// ========== 领养信息相关 API ==========

// 获取领养列表
export const getAdoptList = async (params?: AdoptListParams): Promise<AdoptListResponse> => {
  return await get<AdoptListResponse>('/api/v1/adopts', { params });
};

// 获取领养详情
export const getAdoptDetail = async (id: number): Promise<AdoptInfo> => {
  return await get<AdoptInfo>(`/api/v1/adopts/${id}`);
};

// 创建领养信息
export const createAdopt = async (data: AdoptCreateRequest): Promise<AdoptInfo> => {
  return await post<AdoptInfo>('/api/v1/adopts', data);
};

// 更新领养信息
export const updateAdopt = async (id: number, data: AdoptUpdateRequest): Promise<AdoptInfo> => {
  return await put<AdoptInfo>(`/api/v1/adopts/${id}`, data);
};

// 删除领养信息
export const deleteAdopt = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/adopts/${id}`);
};

// 获取我的领养信息列表
export const getMyAdoptList = async (page = 1, pageSize = 10): Promise<AdoptListResponse> => {
  return await get<AdoptListResponse>('/api/v1/adopts/my', { params: { page, pageSize } });
};

// 更新领养状态
export const updateAdoptStatus = async (data: AdoptionStatusUpdateRequest): Promise<void> => {
  return await post<void>('/api/v1/adopts/status', data);
};

// 获取领养统计信息
export const getAdoptionStats = async (): Promise<AdoptionStats> => {
  return await get<AdoptionStats>('/api/v1/adopts/stats');
};

// ========== 领养申请相关 API ==========

// 获取领养申请列表（按领养信息）
export const getApplicationListByAdoption = async (
  adoptionId: number,
  params?: AdoptionApplicationListParams
): Promise<AdoptionApplicationListResponse> => {
  return await get<AdoptionApplicationListResponse>(
    `/api/v1/adopts/${adoptionId}/applications`,
    { params }
  );
};

// 获取我的领养申请列表
export const getMyApplicationList = async (
  status?: number,
  page = 1,
  pageSize = 10
): Promise<AdoptionApplicationListResponse> => {
  return await get<AdoptionApplicationListResponse>(
    '/api/v1/adopts/applications/my',
    { params: { status, page, pageSize } }
  );
};

// 创建领养申请
export const createApplication = async (data: AdoptionApplicationRequest): Promise<AdoptionApplicationInfo> => {
  return await post<AdoptionApplicationInfo>('/api/v1/adopts/applications', data);
};

// 取消领养申请
export const cancelApplication = async (id: number): Promise<void> => {
  return await post<void>(`/api/v1/adopts/applications/${id}/cancel`);
};

// 审核领养申请
export const reviewApplication = async (data: AdoptionReviewRequest): Promise<void> => {
  return await post<void>('/api/v1/adopts/applications/review', data);
};

// 签署领养协议
export const signAgreement = async (data: AdoptionAgreementRequest): Promise<void> => {
  return await post<void>('/api/v1/adopts/applications/sign', data);
};

// ========== 领养回访相关 API ==========

// 获取领养回访记录列表
export const getFollowUpList = async (
  applicationId: number,
  page = 1,
  pageSize = 10
): Promise<AdoptionFollowUpListResponse> => {
  return await get<AdoptionFollowUpListResponse>(
    `/api/v1/adopts/applications/${applicationId}/follow-ups`,
    { params: { page, pageSize } }
  );
};

// 创建领养回访记录
export const createFollowUp = async (data: AdoptionFollowUpRequest): Promise<AdoptionFollowUpRecord> => {
  return await post<AdoptionFollowUpRecord>('/api/v1/adopts/applications/follow-ups', data);
};

// 更新领养回访记录
export const updateFollowUp = async (
  id: number,
  data: Partial<AdoptionFollowUpRequest>
): Promise<AdoptionFollowUpRecord> => {
  return await put<AdoptionFollowUpRecord>(`/api/v1/adopts/applications/follow-ups/${id}`, data);
};

// 删除领养回访记录
export const deleteFollowUp = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/adopts/applications/follow-ups/${id}`);
};