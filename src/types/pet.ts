import type { LucideIcon } from 'lucide-react';
import { Dog, Cat, Rabbit, Bird, Fish, PawPrint } from 'lucide-react';

export interface PetInfo {
  id: number;
  userId: number;
  name: string;
  avatar: string;
  petType: number;
  breedId: number;
  breedName: string;
  gender: number;
  birthday?: string;
  weight: number;
  personality: string;
  bio: string;
  isSterilized: number;
  isVaccinated: number;
  status: number;
  viewCount: number;
  createdAt: string;
}

export interface PetCreateRequest {
  name: string;
  avatar?: string;
  petType: number;
  breedId?: number;
  breedName?: string;
  gender?: number;
  birthday?: string;
  weight?: number;
  personality?: string;
  bio?: string;
  isSterilized?: number;
  isVaccinated?: number;
}

export interface PetUpdateRequest {
  name?: string;
  avatar?: string;
  petType?: number;
  breedId?: number;
  breedName?: string;
  gender?: number;
  birthday?: string;
  weight?: number;
  personality?: string;
  bio?: string;
  isSterilized?: number;
  isVaccinated?: number;
  status?: number;
}

export interface PetListParams {
  userId?: number;
  petType?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface PetListResponse {
  list: PetInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PetBreedInfo {
  id: number;
  petType: number;
  name: string;
  englishName: string;
  avatar: string;
  sortOrder: number;
}

export type PetAlbumMediaType = 'image' | 'video';

export interface PetAlbumInfo {
  id: number;
  petId: number;
  imageUrl: string;
  thumbUrl: string;
  title: string;
  mediaType: PetAlbumMediaType;
  sortOrder: number;
  createdAt: string;
}

export interface PetGrowthRecordInfo {
  id: number;
  petId: number;
  recordDate: string;
  weight: number;
  height: number;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
}

export interface PetGrowthRecordCreateRequest {
  recordDate: string;
  weight?: number;
  height?: number;
  title: string;
  content?: string;
  images?: string[];
}

export interface LostPetInfo {
  id: number;
  userId: number;
  petId: number;
  petName: string;
  petType: number;
  breedId: number;
  breedName: string;
  gender: number;
  age: string;
  description: string;
  images: string[];
  lostLocation: string;
  lostTime: string;
  contact: string;
  status: number;
  viewCount: number;
  createdAt: string;
}

export interface LostPetCreateRequest {
  petId?: number;
  petName: string;
  petType: number;
  breedId?: number;
  breedName?: string;
  gender?: number;
  age?: string;
  description: string;
  images?: string[];
  lostLocation: string;
  lostTime: string;
  contact: string;
}

export interface LostPetListParams {
  petType?: number;
  lostLocation?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface LostPetListResponse {
  list: LostPetInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PetTypeOption {
  value: number;
  label: string;
  /** 兼容字段：旧 emoji 字符串，仅在无法渲染 Icon 时回退使用 */
  emoji: string;
  /** lucide-react 图标组件，统一在前台页面渲染 */
  Icon: LucideIcon;
}

export const PetTypeOptions: PetTypeOption[] = [
  { value: 1, label: '狗狗', emoji: '🐕', Icon: Dog },
  { value: 2, label: '猫咪', emoji: '🐈', Icon: Cat },
  { value: 3, label: '小宠', emoji: '🐹', Icon: Rabbit },
  { value: 4, label: '鸟类', emoji: '🐦', Icon: Bird },
  { value: 5, label: '水族', emoji: '🐠', Icon: Fish },
];

/** 未知宠物类型的兜底图标 */
export const PetTypeFallbackIcon: LucideIcon = PawPrint;

/** 根据 petType 获取对应 lucide 图标组件，未知类型回退到 PawPrint */
export function getPetTypeIcon(petType: number): LucideIcon {
  return PetTypeOptions.find((t) => t.value === petType)?.Icon ?? PetTypeFallbackIcon;
}

export const GenderOptions = [
  { value: 0, label: '保密' },
  { value: 1, label: '公' },
  { value: 2, label: '母' },
];
