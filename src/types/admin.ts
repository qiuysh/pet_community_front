export interface LoginRequest {
    username: string;
    password: string;
    remember?: boolean;
}

export interface LoginResponse {
    code: number;
    message: string;
    data: {
        token: string;
        user: string;
        expires: number;
    };
}

export interface Admin {
    id: number;
    username: string;
    email: string;
    role: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminLoginRequest {
    username: string;
    password: string;
}

export interface AdminLoginResponse {
    token: string;
    admin: Admin;
}

// Admin User Management Types
export interface AdminListParams {
    page?: number;
    page_size?: number;
    keyword?: string;
}

export interface AdminListResponse {
    list: Admin[];
    total: number;
    page: number;
    page_size: number;
}

export type AdminRole = 'super_admin' | 'content_admin' | 'data_admin' | 'service';

export interface CreateAdminRequest {
    username: string;
    password: string;
    email?: string;
    role: AdminRole;
    status?: 0 | 1;
}

export interface UpdateAdminRequest {
    username?: string;
    email?: string;
    role?: AdminRole;
    status?: 0 | 1;
}

export interface UpdateAdminPasswordRequest {
    password: string;
}

export interface UpdateAdminStatusRequest {
    status: 0 | 1;
}

// System Settings Types
export interface SiteConfig {
    siteName: string;
    siteLogo: string;
    siteDescription: string;
    siteICP: string;
}

export interface AuditConfig {
    autoAuditEnabled: boolean;
    sensitiveFilterEnabled: boolean;
}

export interface SensitiveWord {
    id: number;
    word: string;
    replaceWith: string;
    category: string;
    createdAt: string;
}

export interface AdminOperationLog {
    id: number;
    adminId: number;
    action: string;
    targetType: string;
    targetId: number;
    detail: string;
    ip: string;
    createdAt: string;
}

export interface UserActivityLog {
    id: number;
    userId: number;
    action: string;
    targetType: string;
    targetId: number;
    ip: string;
    createdAt: string;
}

export interface UserBehaviorLog {
    id: number;
    userId: number;
    actionType: string;
    targetType: string;
    targetId: number;
    detail: string;
    ip: string;
    device: string;
    createdAt: string;
}

export interface BehaviorLogListResponse {
    list: UserBehaviorLog[];
    total: number;
}

export interface UpdateSiteConfigRequest {
    siteName: string;
    siteLogo: string;
    siteDescription: string;
    siteICP: string;
}

export interface UpdateAuditConfigRequest {
    autoAuditEnabled: boolean;
    sensitiveFilterEnabled: boolean;
}

export interface AddSensitiveWordRequest {
    word: string;
    replaceWith?: string;
    category?: string;
}

export interface UpdateSensitiveWordRequest {
    word: string;
    replaceWith?: string;
    category?: string;
}

export interface SensitiveWordListResponse {
    list: SensitiveWord[];
    total: number;
}

export interface OperationLogListResponse {
    list: AdminOperationLog[];
    total: number;
}

export interface ActivityLogListResponse {
    list: UserActivityLog[];
    total: number;
}

export interface FrontUser {
    id: number;
    nickname: string;
    avatar: string;
    phone: string;
    email: string;
    gender: number;
    signature: string;
    location: string;
    petYears: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface FrontUserListParams {
    keyword?: string;
    status?: number;
    page?: number;
    page_size?: number;
}

export interface FrontUserListResponse {
    list: FrontUser[];
    total: number;
    page: number;
    page_size: number;
}

export interface BanFrontUserRequest {
    reason: string;
}

export interface BatchBanFrontUsersRequest {
    userIds: number[];
    reason: string;
}

export interface ReviewContent {
    id: number;
    type: 'post' | 'comment' | 'topic';
    content: string;
    images?: string;
    video?: string;
    postId?: number;
    userId: number;
    username: string;
    avatar: string;
    status: number;
    createdAt: string;
}

export interface ReviewListResponse {
    list: ReviewContent[];
    total: number;
    page: number;
    size: number;
}

export interface ReviewHistory {
    id: number;
    targetType: string;
    targetId: number;
    action: string;
    reason?: string;
    adminId: number;
    adminName: string;
    createdAt: string;
}

export interface ReviewHistoryResponse {
    list: ReviewHistory[];
    total: number;
    page: number;
    size: number;
}

export interface ApproveReviewRequest {
    targetType: 'post' | 'comment' | 'topic';
    id: number;
}

export interface RejectReviewRequest {
    targetType: 'post' | 'comment' | 'topic';
    id: number;
    reason: string;
}

export interface BatchReviewRequest {
	targetType: 'post' | 'comment' | 'topic';
	ids: number[];
	status: 1 | 2;
	reason?: string;
}

/** 举报处理动作：通过(下架)/忽略/警告 */
export type ReportHandleAction = 'approve' | 'reject' | 'warn';

export interface AdminReportInfo {
	id: number;
	reporterId: number;
	reporterName?: string;
	targetType: string;
	targetId: number;
	reason: string;
	reasonType: string;
	status: number;
	handleResult?: string;
	handledBy?: number;
	handledAt?: string;
	createdAt: string;
}

export interface AdminReportListResponse {
	list: AdminReportInfo[];
	total: number;
	page: number;
	pageSize: number;
}

export interface HandleReportRequest {
	action: ReportHandleAction;
	result?: string;
}

export interface BatchHandleReportRequest {
	ids: number[];
	action: ReportHandleAction;
	result?: string;
}

export interface ReportTypeCount {
	type: string;
	count: number;
}

export interface ReportStatsResponse {
	total: number;
	pending: number;
	handled: number;
	ignored: number;
	handleRate: number;
	byReasonType: ReportTypeCount[];
	byTargetType: ReportTypeCount[];
}

export interface SystemNotification {
	id: number;
	type: number;
	title: string;
	content: string;
	targetType: number;
	targetIds?: string;
	status: number;
	publishAt?: string;
	adminId: number;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationListResponse {
	list: SystemNotification[];
	total: number;
}

export interface CreateNotificationRequest {
	title: string;
	content: string;
	type: 1 | 2 | 3;
	targetType: 0 | 1 | 2;
	targetIds?: number[];
	publishAt?: string;
}

export interface UpdateNotificationRequest {
	title?: string;
	content?: string;
	type?: 1 | 2 | 3;
	targetType?: 0 | 1 | 2;
	targetIds?: number[];
	publishAt?: string;
}

export interface Announcement {
	id: number;
	title: string;
	content: string;
	type: number;
	status: number;
	sortOrder: number;
	adminId: number;
	startAt?: string;
	endAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AnnouncementListResponse {
	list: Announcement[];
	total: number;
}

export interface CreateAnnouncementRequest {
	title: string;
	content: string;
	type?: number;
	sortOrder?: number;
	startAt?: string;
	endAt?: string;
}

export interface UpdateAnnouncementRequest {
	title?: string;
	content?: string;
	type?: number;
	sortOrder?: number;
	startAt?: string;
	endAt?: string;
}

export interface UpdateAnnouncementStatusRequest {
	status: 0 | 1;
}