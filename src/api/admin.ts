// front/src/api/admin.ts
import { get, post, put, del } from './axios';
import { 
    AdminLoginRequest, 
    AdminLoginResponse,
    Admin,
    AdminListParams,
    AdminListResponse,
    CreateAdminRequest,
    UpdateAdminRequest,
    UpdateAdminPasswordRequest,
    UpdateAdminStatusRequest,
    SiteConfig,
    AuditConfig,
    UpdateSiteConfigRequest,
    UpdateAuditConfigRequest,
    AddSensitiveWordRequest,
    UpdateSensitiveWordRequest,
    SensitiveWordListResponse,
    OperationLogListResponse,
    ActivityLogListResponse,
    ReviewListResponse,
    ReviewHistoryResponse,
    ApproveReviewRequest,
    RejectReviewRequest,
    BatchReviewRequest,
    FrontUser,
    FrontUserListParams,
    FrontUserListResponse,
    BanFrontUserRequest,
    BatchBanFrontUsersRequest,
    SystemNotification,
    NotificationListResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    Announcement,
    AnnouncementListResponse,
    CreateAnnouncementRequest,
    UpdateAnnouncementRequest,
    UpdateAnnouncementStatusRequest,
    BehaviorLogListResponse,
    LogStatsResponse,
    AdminReportListResponse,
    HandleReportRequest,
    BatchHandleReportRequest,
    ReportStatsResponse
} from '../types/admin';
import {
    UserGrowthStats,
    ContentStats,
    InteractionStats,
    ExportStatsRequest
} from '../types/stats';
import {
    DashboardOverview,
    TodoAggregate,
    ComparisonData,
    DistributionData,
    TrendType,
    CompareType,
    DistributionType
} from '../types/chart';

export const login = async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    return await post<AdminLoginResponse>('/api/v1/admin/login', data);
};

export const getPublicKey = async (): Promise<{ publicKey: string }> => {
    return await get<{ publicKey: string }>('/api/v1/public-key');
};

// Admin User Management APIs
export const getAdminList = async (params?: AdminListParams): Promise<AdminListResponse> => {
    return await get<AdminListResponse>('/api/v1/admin/users', { params });
};

export const getAdminById = async (id: number): Promise<Admin> => {
    return await get<Admin>(`/api/v1/admin/users/${id}`);
};

export const createAdmin = async (data: CreateAdminRequest): Promise<Admin> => {
    return await post<Admin>('/api/v1/admin/users', data);
};

export const updateAdmin = async (id: number, data: UpdateAdminRequest): Promise<Admin> => {
    return await put<Admin>(`/api/v1/admin/users/${id}`, data);
};

export const updateAdminPassword = async (id: number, data: UpdateAdminPasswordRequest): Promise<void> => {
    return await put<void>(`/api/v1/admin/users/${id}/password`, data);
};

export const deleteAdmin = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/users/${id}`);
};

export const updateAdminStatus = async (id: number, data: UpdateAdminStatusRequest): Promise<void> => {
    return await put<void>(`/api/v1/admin/users/${id}/status`, data);
};

// System Settings APIs
export const getSiteConfig = async (): Promise<SiteConfig> => {
    return await get<SiteConfig>('/api/v1/admin/settings/site');
};

export const updateSiteConfig = async (data: UpdateSiteConfigRequest): Promise<void> => {
    return await put<void>('/api/v1/admin/settings/site', data);
};

export const getAuditConfig = async (): Promise<AuditConfig> => {
    return await get<AuditConfig>('/api/v1/admin/settings/audit');
};

export const updateAuditConfig = async (data: UpdateAuditConfigRequest): Promise<void> => {
    return await put<void>('/api/v1/admin/settings/audit', data);
};

// Sensitive Words APIs
export const getSensitiveWords = async (keyword?: string, page = 1, limit = 20): Promise<SensitiveWordListResponse> => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    return await get<SensitiveWordListResponse>(`/api/v1/admin/sensitive-words?${params.toString()}`);
};

export const addSensitiveWord = async (data: AddSensitiveWordRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/sensitive-words', data);
};

export const updateSensitiveWord = async (id: number, data: UpdateSensitiveWordRequest): Promise<void> => {
    return await put<void>(`/api/v1/admin/sensitive-words/${id}`, data);
};

export const deleteSensitiveWord = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/sensitive-words/${id}`);
};

// Logs APIs
export const getOperationLogs = async (params: {
    adminId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
}): Promise<OperationLogListResponse> => {
    const query = new URLSearchParams();
    if (params.adminId) query.set('adminId', params.adminId.toString());
    if (params.action) query.set('action', params.action);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<OperationLogListResponse>(`/api/v1/admin/logs/operations?${query.toString()}`);
};

export const getActivityLogs = async (params: {
    userId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
}): Promise<ActivityLogListResponse> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.action) query.set('action', params.action);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<ActivityLogListResponse>(`/api/v1/admin/logs/activities?${query.toString()}`);
};

export const getPendingReviews = async (params: {
    type?: 'post' | 'comment' | 'topic';
    page?: number;
    pageSize?: number;
}): Promise<ReviewListResponse> => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('page_size', params.pageSize.toString());
    return await get<ReviewListResponse>(`/api/v1/admin/reviews/pending?${query.toString()}`);
};

export const approveReview = async (data: ApproveReviewRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/reviews/approve', data);
};

export const rejectReview = async (data: RejectReviewRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/reviews/reject', data);
};

export const batchReview = async (data: BatchReviewRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/reviews/batch', data);
};

export const getReviewHistory = async (params: {
    type?: string;
    page?: number;
    pageSize?: number;
}): Promise<ReviewHistoryResponse> => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('page_size', params.pageSize.toString());
    return await get<ReviewHistoryResponse>(`/api/v1/admin/reviews/history?${query.toString()}`);
};

// 举报管理 Ad4
export const getAdminReports = async (params?: {
    status?: number;
    reasonType?: string;
    targetType?: string;
    page?: number;
    pageSize?: number;
}): Promise<AdminReportListResponse> => {
    const query = new URLSearchParams();
    if (params?.status !== undefined) query.set('status', params.status.toString());
    if (params?.reasonType) query.set('reasonType', params.reasonType);
    if (params?.targetType) query.set('targetType', params.targetType);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('page_size', params.pageSize.toString());
    return await get<AdminReportListResponse>(`/api/v1/admin/reports?${query.toString()}`);
};

export const handleAdminReport = async (id: number, data: HandleReportRequest): Promise<void> => {
    return await post<void>(`/api/v1/admin/reports/${id}/handle`, data);
};

export const batchHandleAdminReports = async (data: BatchHandleReportRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/reports/batch', data);
};

export const getAdminReportStats = async (): Promise<ReportStatsResponse> => {
    return await get<ReportStatsResponse>('/api/v1/admin/reports/stats');
};

export const getFrontUserList = async (params?: FrontUserListParams): Promise<FrontUserListResponse> => {
    return await get<FrontUserListResponse>('/api/v1/admin/front-users', { params });
};

export const getFrontUserById = async (id: number): Promise<FrontUser> => {
    return await get<FrontUser>(`/api/v1/admin/front-users/${id}`);
};

export const banFrontUser = async (id: number, data: BanFrontUserRequest): Promise<void> => {
    return await put<void>(`/api/v1/admin/front-users/${id}/ban`, data);
};

export const unbanFrontUser = async (id: number): Promise<void> => {
    return await put<void>(`/api/v1/admin/front-users/${id}/unban`);
};

export const batchBanFrontUsers = async (data: BatchBanFrontUsersRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/front-users/batch-ban', data);
};

export const getFrontUserOperationLogs = async (params: {
    userId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
}): Promise<OperationLogListResponse> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.action) query.set('action', params.action);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<OperationLogListResponse>(`/api/v1/admin/front-users/logs?${query.toString()}`);
};

// Dashboard APIs - 运营驾驶舱
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
    return await get<DashboardOverview>('/api/v1/admin/dashboard/overview');
};

export const getTodoAggregate = async (): Promise<TodoAggregate> => {
    return await get<TodoAggregate>('/api/v1/admin/dashboard/todo');
};

// Stats APIs - 分析报表
export const getUserGrowthStats = async (startDate: string, endDate: string): Promise<UserGrowthStats> => {
    return await get<UserGrowthStats>(`/api/v1/admin/stats/user-growth?startDate=${startDate}&endDate=${endDate}`);
};

export const getContentStats = async (startDate: string, endDate: string): Promise<ContentStats> => {
    return await get<ContentStats>(`/api/v1/admin/stats/content?startDate=${startDate}&endDate=${endDate}`);
};

export const getInteractionStats = async (startDate: string, endDate: string): Promise<InteractionStats> => {
    return await get<InteractionStats>(`/api/v1/admin/stats/interaction?startDate=${startDate}&endDate=${endDate}`);
};

export const getComparisonStats = async (type: TrendType, compare: CompareType = 'week'): Promise<ComparisonData> => {
    return await get<ComparisonData>(`/api/v1/admin/stats/comparison?type=${type}&compare=${compare}`);
};

export const getDistributionStats = async (type: DistributionType): Promise<DistributionData> => {
    return await get<DistributionData>(`/api/v1/admin/stats/distribution?type=${type}`);
};

export const exportStats = async (data: ExportStatsRequest): Promise<Blob> => {
    return await post<Blob>('/api/v1/admin/stats/export', data, {
        responseType: 'blob'
    });
};

export const createNotification = async (data: CreateNotificationRequest): Promise<SystemNotification> => {
    return await post<SystemNotification>('/api/v1/admin/notifications', data);
};

export const updateNotification = async (id: number, data: UpdateNotificationRequest): Promise<SystemNotification> => {
    return await put<SystemNotification>(`/api/v1/admin/notifications/${id}`, data);
};

export const deleteNotification = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/notifications/${id}`);
};

export const getNotificationById = async (id: number): Promise<SystemNotification> => {
    return await get<SystemNotification>(`/api/v1/admin/notifications/${id}`);
};

export const getNotifications = async (params: {
    type?: number;
    status?: number;
    page?: number;
    limit?: number;
}): Promise<NotificationListResponse> => {
    const query = new URLSearchParams();
    if (params.type !== undefined) query.set('type', params.type.toString());
    if (params.status !== undefined) query.set('status', params.status.toString());
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<NotificationListResponse>(`/api/v1/admin/notifications?${query.toString()}`);
};

export const sendNotification = async (id: number): Promise<void> => {
    return await post<void>(`/api/v1/admin/notifications/${id}/send`);
};

export const createAnnouncement = async (data: CreateAnnouncementRequest): Promise<Announcement> => {
    return await post<Announcement>('/api/v1/admin/announcements', data);
};

export const updateAnnouncement = async (id: number, data: UpdateAnnouncementRequest): Promise<Announcement> => {
    return await put<Announcement>(`/api/v1/admin/announcements/${id}`, data);
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/announcements/${id}`);
};

export const getAnnouncementById = async (id: number): Promise<Announcement> => {
    return await get<Announcement>(`/api/v1/admin/announcements/${id}`);
};

export const getAnnouncements = async (params: {
    type?: number;
    status?: number;
    page?: number;
    limit?: number;
}): Promise<AnnouncementListResponse> => {
    const query = new URLSearchParams();
    if (params.type !== undefined) query.set('type', params.type.toString());
    if (params.status !== undefined) query.set('status', params.status.toString());
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<AnnouncementListResponse>(`/api/v1/admin/announcements?${query.toString()}`);
};

export const updateAnnouncementStatus = async (id: number, data: UpdateAnnouncementStatusRequest): Promise<void> => {
    return await put<void>(`/api/v1/admin/announcements/${id}/status`, data);
};

export const pinAnnouncement = async (id: number): Promise<void> => {
    return await post<void>(`/api/v1/admin/announcements/${id}/pin`);
};

import {
    AdPosition,
    AdPositionListResponse,
    CreateAdPositionRequest,
    UpdateAdPositionRequest,
    Advertisement,
    AdvertisementListResponse,
    CreateAdRequest,
    UpdateAdRequest,
    ReviewAdRequest,
    AdStatsResponse
} from '../types/advertisement';

export const createAdPosition = async (data: CreateAdPositionRequest): Promise<AdPosition> => {
    return await post<AdPosition>('/api/v1/admin/ad-positions', data);
};

export const getAdPositionList = async (params?: {
    page?: number;
    page_size?: number;
}): Promise<AdPositionListResponse> => {
    return await get<AdPositionListResponse>('/api/v1/admin/ad-positions', { params });
};

export const getAdPositionById = async (id: number): Promise<AdPosition> => {
    return await get<AdPosition>(`/api/v1/admin/ad-positions/${id}`);
};

export const updateAdPosition = async (id: number, data: UpdateAdPositionRequest): Promise<AdPosition> => {
    return await put<AdPosition>(`/api/v1/admin/ad-positions/${id}`, data);
};

export const deleteAdPosition = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/ad-positions/${id}`);
};

export const createAd = async (data: CreateAdRequest): Promise<Advertisement> => {
    return await post<Advertisement>('/api/v1/admin/ads', data);
};

export const getAdList = async (params?: {
    positionId?: number;
    status?: number;
    page?: number;
    page_size?: number;
}): Promise<AdvertisementListResponse> => {
    return await get<AdvertisementListResponse>('/api/v1/admin/ads', { params });
};

export const getAdById = async (id: number): Promise<Advertisement> => {
    return await get<Advertisement>(`/api/v1/admin/ads/${id}`);
};

export const updateAd = async (id: number, data: UpdateAdRequest): Promise<Advertisement> => {
    return await put<Advertisement>(`/api/v1/admin/ads/${id}`, data);
};

export const deleteAd = async (id: number): Promise<void> => {
    return await del<void>(`/api/v1/admin/ads/${id}`);
};

export const reviewAd = async (data: ReviewAdRequest): Promise<void> => {
    return await post<void>('/api/v1/admin/ads/review', data);
};

export const incrementAdView = async (id: number): Promise<void> => {
    return await post<void>(`/api/v1/admin/ads/${id}/view`);
};

export const incrementAdClick = async (id: number): Promise<void> => {
    return await post<void>(`/api/v1/admin/ads/${id}/click`);
};

export const getAdStats = async (params?: {
    startDate?: string;
    endDate?: string;
}): Promise<AdStatsResponse> => {
    return await get<AdStatsResponse>('/api/v1/admin/ads/stats', { params });
};

export const getUserBehaviorLogs = async (params: {
    userId?: number;
    actionType?: string;
    targetType?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
}): Promise<BehaviorLogListResponse> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.actionType) query.set('actionType', params.actionType);
    if (params.targetType) query.set('targetType', params.targetType);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<BehaviorLogListResponse>(`/api/v1/admin/logs/behavior?${query.toString()}`);
};

export const getSecurityAuditLogs = async (params: {
    userId?: number;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
}): Promise<BehaviorLogListResponse> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return await get<BehaviorLogListResponse>(`/api/v1/admin/logs/security?${query.toString()}`);
};

export const exportLogs = async (params: {
    userId?: number;
    actionType?: string;
    targetType?: string;
    startTime?: string;
    endTime?: string;
}): Promise<Blob> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.actionType) query.set('actionType', params.actionType);
    if (params.targetType) query.set('targetType', params.targetType);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    return await get<Blob>(`/api/v1/admin/logs/export?${query.toString()}`, {
        responseType: 'blob'
    });
};

export const getLogStats = async (params: {
    userId?: number;
    actionType?: string;
    startTime?: string;
    endTime?: string;
    days?: number;
}): Promise<LogStatsResponse> => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId.toString());
    if (params.actionType) query.set('actionType', params.actionType);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.days) query.set('days', params.days.toString());
    return await get<LogStatsResponse>(`/api/v1/admin/logs/stats?${query.toString()}`);
};