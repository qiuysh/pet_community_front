import type { AxiosRequestConfig } from 'axios';
import { post } from './axios';

/** 通用上传响应（后端按扩展名判定媒体类型） */
export interface UploadMediaResponse {
  url: string;
  type: 'image' | 'video';
}

/** 上传请求配置：skipTransform 用于跳过 axios 对 FormData 的默认 transform */
interface UploadRequestConfig extends AxiosRequestConfig {
  skipTransform?: boolean;
}

/**
 * 上传单个图片/视频，返回对外可访问的 URL。
 * 用于没有专属上传端点的场景（目前是活动作品提交）。
 * 限制由后端统一裁决：图片 jpg/jpeg/png/gif/webp/bmp ≤5MB，视频 MP4 ≤50MB。
 */
export const uploadMedia = async (file: File): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const config: UploadRequestConfig = {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipTransform: true,
  };
  return await post<UploadMediaResponse>('/api/v1/upload', formData, config);
};
