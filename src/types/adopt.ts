// 领养状态枚举
export enum AdoptionStatus {
  PENDING = 0,      // 待领养
  ADOPTED = 1,      // 已领养
  CANCELLED = 2,    // 已取消
}

// 申请状态枚举
export enum ApplicationStatus {
  PENDING = 0,      // 审核中
  APPROVED = 1,     // 已通过
  REJECTED = 2,     // 已拒绝
}

// 宠物性别枚举
export enum PetGender {
  UNKNOWN = 0,      // 未知
  MALE = 1,         // 公
  FEMALE = 2,       // 母
}

// 宠物类型枚举
export enum PetType {
  CAT = 'cat',
  DOG = 'dog',
  BIRD = 'bird',
  FISH = 'fish',
  OTHER = 'other',
}

// 领养信息接口
export interface AdoptInfo {
  id: number;
  petId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  petName: string;
  petType: PetType;
  petAge: string;
  petGender: PetGender;
  healthStatus: string;
  photos: string[];
  description: string;
  adoptConditions: string;
  location: string;
  contactPhone: string;
  status: AdoptionStatus;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

// 创建领养信息请求
export interface AdoptCreateRequest {
  petId?: number;
  petName: string;
  petType: PetType;
  petAge?: string;
  petGender?: PetGender;
  healthStatus?: string;
  photos: string[];
  description: string;
  adoptConditions?: string;
  location: string;
  contactPhone: string;
}

// 更新领养信息请求
export interface AdoptUpdateRequest extends Partial<AdoptCreateRequest> {
  status?: AdoptionStatus;
}

// 领养列表查询参数
export interface AdoptListParams {
  petType?: PetType;
  status?: AdoptionStatus;
  location?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 领养列表响应
export interface AdoptListResponse {
  list: AdoptInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 领养申请信息接口
export interface AdoptionApplicationInfo {
  id: number;
  adoptionId: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  applicationInfo: string;
  status: ApplicationStatus;
  reviewedBy: number;
  reviewedAt: string;
  agreementSigned: boolean;
  createdAt: string;
  updatedAt: string;
}

// 领养申请请求
export interface AdoptionApplicationRequest {
  adoptionId: number;
  applicationInfo: string;
}

// 领养申请列表查询参数
export interface AdoptionApplicationListParams {
  adoptionId?: number;
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
}

// 领养申请列表响应
export interface AdoptionApplicationListResponse {
  list: AdoptionApplicationInfo[];
  total: number;
  page: number;
  pageSize: number;
}

// 领养审核请求
export interface AdoptionReviewRequest {
  applicationId: number;
  approve: boolean;
  reason?: string;
}

// 领养协议签署请求
export interface AdoptionAgreementRequest {
  applicationId: number;
  agreementText: string;
  signature: string;
}

// 领养状态更新请求
export interface AdoptionStatusUpdateRequest {
  adoptionId: number;
  status: AdoptionStatus;
}

// 领养统计信息
export interface AdoptionStats {
  totalAdoptions: number;
  pendingAdoptions: number;
  adoptedAdoptions: number;
  cancelledAdoptions: number;
  totalApplications: number;
}

// 领养回访记录接口
export interface AdoptionFollowUpRecord {
  id: number;
  applicationId: number;
  adoptionId: number;
  userId: number;
  userNickname: string;
  content: string;
  followUpDate: string;
  petHealthStatus?: string;
  notes?: string;
  createdAt: string;
}

// 创建领养回访记录请求
export interface AdoptionFollowUpRequest {
  applicationId: number;
  content: string;
  followUpDate: string;
  petHealthStatus?: string;
  notes?: string;
}

// 领养回访记录列表响应
export interface AdoptionFollowUpListResponse {
  list: AdoptionFollowUpRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 领养状态选项
export const AdoptionStatusOptions = [
  { value: AdoptionStatus.PENDING, label: '待领养', color: 'green' },
  { value: AdoptionStatus.ADOPTED, label: '已领养', color: 'blue' },
  { value: AdoptionStatus.CANCELLED, label: '已取消', color: 'red' },
];

// 申请状态选项
export const ApplicationStatusOptions = [
  { value: ApplicationStatus.PENDING, label: '审核中', color: 'orange' },
  { value: ApplicationStatus.APPROVED, label: '已通过', color: 'green' },
  { value: ApplicationStatus.REJECTED, label: '已拒绝', color: 'red' },
];

// 宠物类型选项
export const PetTypeOptions = [
  { value: PetType.CAT, label: '猫咪' },
  { value: PetType.DOG, label: '狗狗' },
  { value: PetType.BIRD, label: '鸟类' },
  { value: PetType.FISH, label: '鱼类' },
  { value: PetType.OTHER, label: '其他' },
];

// 宠物性别选项
export const PetGenderOptions = [
  { value: PetGender.UNKNOWN, label: '未知' },
  { value: PetGender.MALE, label: '公' },
  { value: PetGender.FEMALE, label: '母' },
];