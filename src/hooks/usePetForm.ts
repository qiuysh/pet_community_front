import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPet, updatePet, getPetDetail, getPetBreeds, uploadPetAvatar } from '../api/pet';
import { useAsync } from './useAsync';
import { showSuccessToast, showErrorToast } from '../utils/toastManager';
import { PetCreateRequest, PetBreedInfo } from '../types/pet';

/**
 * 宠物创建/编辑表单 hook
 *
 * 管理:
 * - 编辑模式: 加载宠物详情填充表单
 * - 品种列表: 按 petType 动态加载
 * - 提交: createPet / updatePet
 *
 * 用法:
 *   const { isEdit, loading, breeds, formData, updateField, handleSubmit } = usePetForm();
 */
export function usePetForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { loading, run } = useAsync();
  const { run: runBreeds } = useAsync();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [breeds, setBreeds] = useState<PetBreedInfo[]>([]);
  const [formData, setFormData] = useState<PetCreateRequest>({
    name: '',
    petType: 1,
    breedId: 0,
    breedName: '',
    gender: 0,
    weight: 0,
    personality: '',
    bio: '',
    isSterilized: 0,
    isVaccinated: 0,
  });

  useEffect(() => {
    fetchBreeds(formData.petType);
  }, [formData.petType]);

  useEffect(() => {
    if (isEdit && id) {
      fetchPetDetail(parseInt(id));
    }
  }, [isEdit, id]);

  const fetchBreeds = (petType: number) => runBreeds(
    () => getPetBreeds(petType),
    (data) => setBreeds(data),
    (err) => console.error('获取品种列表失败', err),
  );

  const fetchPetDetail = (petId: number) => run(
    () => getPetDetail(petId),
    (pet) => {
      setFormData({
        name: pet.name,
        avatar: pet.avatar,
        petType: pet.petType,
        breedId: pet.breedId,
        breedName: pet.breedName,
        gender: pet.gender,
        weight: pet.weight,
        personality: pet.personality,
        bio: pet.bio,
        isSterilized: pet.isSterilized,
        isVaccinated: pet.isVaccinated,
      });
    },
    () => {
      showErrorToast('获取宠物信息失败');
      navigate('/pets');
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('请输入宠物名称');
      return;
    }

    run(
      async () => {
        if (isEdit && id) {
          await updatePet(parseInt(id), formData);
          return { mode: 'edit' as const };
        }
        const pet = await createPet(formData);
        return { mode: 'create' as const, pet };
      },
      (result) => {
        if (result.mode === 'edit') {
          showSuccessToast('修改成功');
          navigate(-1);
        } else {
          showSuccessToast('创建成功');
          navigate(`/pets/${result.pet.id}`);
        }
      },
      (err: unknown) => showErrorToast((err as Error).message || '操作失败'),
    );
  };

  const updateField = (field: keyof PetCreateRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      showErrorToast('仅支持 JPG、PNG、WebP 格式');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showErrorToast('头像大小不能超过 2MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const res = await uploadPetAvatar(file);
      updateField('avatar', res.url);
      showSuccessToast('头像已上传');
    } catch (err) {
      showErrorToast((err as Error).message || '头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
    isEdit,
    loading,
    uploadingAvatar,
    breeds,
    formData,
    updateField,
    handleAvatarUpload,
    handleSubmit,
  };
}
