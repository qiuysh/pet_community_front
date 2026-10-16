import { get, post, put, del } from './axios';
import {
  PetInfo,
  PetCreateRequest,
  PetUpdateRequest,
  PetListParams,
  PetListResponse,
  PetBreedInfo,
  PetAlbumInfo,
  PetGrowthRecordInfo,
  PetGrowthRecordCreateRequest,
  LostPetInfo,
  LostPetCreateRequest,
  LostPetListParams,
  LostPetListResponse,
} from '../types/pet';

export const getPetBreeds = async (petType?: number): Promise<PetBreedInfo[]> => {
  const params = new URLSearchParams();
  if (petType) params.set('petType', petType.toString());
  return await get<PetBreedInfo[]>(`/api/v1/pets/breeds?${params.toString()}`);
};

export const getPetList = async (params: PetListParams): Promise<PetListResponse> => {
  return await get<PetListResponse>('/api/v1/pets', { params });
};

export const getPetDetail = async (id: number): Promise<PetInfo> => {
  return await get<PetInfo>(`/api/v1/pets/${id}`);
};

export const getMyPets = async (): Promise<PetInfo[]> => {
  return await get<PetInfo[]>('/api/v1/pets/mine/list');
};

export const createPet = async (data: PetCreateRequest): Promise<PetInfo> => {
  return await post<PetInfo>('/api/v1/pets', data);
};

export const updatePet = async (id: number, data: PetUpdateRequest): Promise<PetInfo> => {
  return await put<PetInfo>(`/api/v1/pets/${id}`, data);
};

export const deletePet = async (id: number): Promise<void> => {
  return await del<void>(`/api/v1/pets/${id}`);
};

export interface UploadPetAlbumPhotoResponse {
  url: string;
}

/** 上传宠物头像（multipart field=file，≤2MB） */
export const uploadPetAvatar = async (file: File): Promise<UploadPetAlbumPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UploadPetAlbumPhotoResponse>('/api/v1/pets/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  } as any);
};

/** 上传宠物相册图片（multipart field=file，≤5MB） */
export const uploadPetAlbumPhoto = async (file: File): Promise<UploadPetAlbumPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UploadPetAlbumPhotoResponse>('/api/v1/pets/upload-album-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  } as any);
};

/** 上传宠物相册视频（multipart field=file，MP4 ≤50MB） */
export const uploadPetAlbumVideo = async (file: File): Promise<UploadPetAlbumPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UploadPetAlbumPhotoResponse>('/api/v1/pets/upload-album-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  } as any);
};

export const getPetAlbum = async (petId: number): Promise<PetAlbumInfo[]> => {
  return await get<PetAlbumInfo[]>(`/api/v1/pets/${petId}/album`);
};

export const addPetAlbumPhoto = async (petId: number, data: {
  imageUrl: string;
  thumbUrl?: string;
  title?: string;
  mediaType?: 'image' | 'video';
  sortOrder?: number;
}): Promise<PetAlbumInfo> => {
  return await post<PetAlbumInfo>(`/api/v1/pets/${petId}/album`, data);
};

export const reorderPetAlbum = async (petId: number, ids: number[]): Promise<void> => {
  return await put<void>(`/api/v1/pets/${petId}/album/sort`, { ids });
};

export const deletePetAlbumPhoto = async (petId: number, photoId: number): Promise<void> => {
  return await del<void>(`/api/v1/pets/${petId}/album/${photoId}`);
};

export const getGrowthRecords = async (petId: number, page = 1, pageSize = 20): Promise<{ list: PetGrowthRecordInfo[]; total: number }> => {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('pageSize', pageSize.toString());
  return await get<{ list: PetGrowthRecordInfo[]; total: number }>(`/api/v1/pets/${petId}/growth-records?${params.toString()}`);
};

export const createGrowthRecord = async (petId: number, data: PetGrowthRecordCreateRequest): Promise<PetGrowthRecordInfo> => {
  return await post<PetGrowthRecordInfo>(`/api/v1/pets/${petId}/growth-records`, data);
};

export const updateGrowthRecord = async (petId: number, recordId: number, data: Partial<PetGrowthRecordCreateRequest>): Promise<PetGrowthRecordInfo> => {
  return await put<PetGrowthRecordInfo>(`/api/v1/pets/${petId}/growth-records/${recordId}`, data);
};

export const deleteGrowthRecord = async (petId: number, recordId: number): Promise<void> => {
  return await del<void>(`/api/v1/pets/${petId}/growth-records/${recordId}`);
};

export const getLostPetList = async (params: LostPetListParams): Promise<LostPetListResponse> => {
  return await get<LostPetListResponse>('/api/v1/lost-pets', { params });
};

export const getLostPetDetail = async (id: number): Promise<LostPetInfo> => {
  return await get<LostPetInfo>(`/api/v1/lost-pets/${id}`);
};

/** 上传寻宠启事图片（multipart field=file，≤5MB） */
export const uploadLostPetPhoto = async (file: File): Promise<UploadPetAlbumPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await post<UploadPetAlbumPhotoResponse>('/api/v1/lost-pets/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  } as any);
};

export const createLostPet = async (data: LostPetCreateRequest): Promise<LostPetInfo> => {
  return await post<LostPetInfo>('/api/v1/lost-pets', data);
};

export const updateLostPetStatus = async (id: number, status: number): Promise<void> => {
  return await put<void>(`/api/v1/lost-pets/${id}/status`, { status });
};
