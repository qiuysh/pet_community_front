import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdopt, uploadAdoptPhoto } from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsync } from './useAsync';
import type { FormErrors } from './useFormErrors';
import { AdoptCreateRequest, PetType, PetGender } from '../types/adopt';

type AdoptField = 'petName' | 'description' | 'photos' | 'location' | 'contactPhone';

/** 是否是 placeholder 占位符（尚未上传成功）的 URL */
export const isPlaceholderPhoto = (url: string): boolean =>
  url.startsWith('placeholder-url') || url.startsWith('blob:') || url.startsWith('file:');

/**
 * 领养发布表单 hook
 *
 * 管理:
 * - 表单数据(petName/petType/photos/description/location/contactPhone 等)
 * - 照片上传(本地预览 placeholder + 串行上传替换为真实 URL)
 * - 提交校验 + createAdopt
 *
 * 用法:
 *   const { loading, uploading, formData, setFormData, handleSubmit, handlePhotoUpload } = useAdoptCreate();
 */
export function useAdoptCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, run } = useAsync();
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<AdoptField>>({});
  const [formData, setFormData] = useState<AdoptCreateRequest>({
    petName: '',
    petType: PetType.CAT,
    petAge: '',
    petGender: PetGender.UNKNOWN,
    healthStatus: '',
    photos: [],
    description: '',
    adoptConditions: '',
    location: '',
    contactPhone: '',
  });

  const clearError = (field: AdoptField) => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = () => {
    const next: FormErrors<AdoptField> = {};
    if (!formData.petName.trim()) {
      next.petName = '请填写宠物名称';
    }
    if (!formData.description.trim()) {
      next.description = '请填写宠物介绍';
    }
    if (!formData.location.trim()) {
      next.location = '请填写所在地区';
    }
    if (!formData.contactPhone.trim()) {
      next.contactPhone = '请填写联系电话';
    }
    if (formData.photos.length === 0) {
      next.photos = '请上传至少一张照片';
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const first = Object.keys(next)[0] as AdoptField;
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      });
      return;
    }
    setErrors({});
    if (uploading) {
      toast.error('照片正在上传中，请稍候…');
      return;
    }
    const placeholders = formData.photos.filter(isPlaceholderPhoto);
    if (placeholders.length > 0) {
      toast.error(`${placeholders.length} 张照片尚未完成上传，请等待上传结束`);
      return;
    }

    run(
      () => createAdopt(formData),
      (res) => {
        toast.success('发布成功');
        navigate(`/adopts/${res.id}`);
      },
      () => toast.error('发布失败'),
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slotsRemaining = 9 - formData.photos.length;
    if (slotsRemaining <= 0) {
      toast.error('最多上传 9 张照片');
      return;
    }
    const accepted = Array.from(files).slice(0, slotsRemaining);
    const validFiles: File[] = [];
    for (const f of accepted) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} 超过 5MB，已跳过`);
        continue;
      }
      validFiles.push(f);
    }
    if (validFiles.length === 0) return;

    e.target.value = '';

    const timeMs = Date.now();
    const placeholderUrls = validFiles.map(
      (_, i) => `placeholder-url-${timeMs}-${i}`,
    );
    const previewPair = validFiles.map((f, i) => ({ placeholder: placeholderUrls[i], file: f }));

    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...placeholderUrls] }));
    setUploading(true);

    try {
      for (const { placeholder, file } of previewPair) {
        try {
          const res = await uploadAdoptPhoto(file);
          setFormData((prev) => ({
            ...prev,
            photos: prev.photos.map((u) => (u === placeholder ? res.url : u)),
          }));
        } catch (err: unknown) {
          toast.error(`${file.name} 上传失败：${(err as Error).message || '请重试'}`);
          setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((u) => u !== placeholder),
          }));
        }
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    loading,
    uploading,
    formData,
    setFormData,
    errors,
    clearError,
    handleSubmit,
    handlePhotoUpload,
  };
}
