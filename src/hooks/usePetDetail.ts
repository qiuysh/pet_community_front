import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPetDetail,
  getPetAlbum,
  getGrowthRecords,
  uploadPetAlbumPhoto,
  uploadPetAlbumVideo,
  addPetAlbumPhoto,
  deletePetAlbumPhoto,
  reorderPetAlbum,
  createGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  updatePet,
} from '../api/pet';
import { useUserStore } from '../stores/userStore';
import { useAsync, useAsyncEffect } from './useAsync';
import { showErrorToast, showSuccessToast } from '../utils/toastManager';
import {
  PetInfo,
  PetAlbumInfo,
  PetGrowthRecordInfo,
  PetGrowthRecordCreateRequest,
} from '../types/pet';

export type PetDetailTab = 'album' | 'growth' | 'posts';

const MAX_ALBUM_BATCH = 9;
const MAX_ALBUM_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ALBUM_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_ALBUM_VIDEO_SEC = 60;

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取视频信息'));
    };
    video.src = url;
  });
}

/**
 * 宠物详情 hook：详情/相册/成长读写（主人可上传删除排序相册、增删改成长记录）
 */
export function usePetDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<PetDetailTab>('album');
  const { user } = useUserStore();
  const { loading: mutating, run } = useAsync();
  const [uploading, setUploading] = useState(false);

  const petHook = useAsyncEffect(
    async () => {
      if (!id) return undefined;
      return await getPetDetail(parseInt(id));
    },
    [id],
    { onError: () => showErrorToast('获取宠物信息失败') },
  );
  const pet = petHook.data as PetInfo | undefined;

  const albumHook = useAsyncEffect(
    async () => {
      if (!pet?.id) return [];
      return await getPetAlbum(pet.id);
    },
    [pet?.id],
    { onError: (err) => console.error('获取相册失败', err) },
  );
  const album: PetAlbumInfo[] = albumHook.data ?? [];

  const growthHook = useAsyncEffect(
    async () => {
      if (!pet?.id) return { list: [], total: 0 };
      return await getGrowthRecords(pet.id, 1, 50);
    },
    [pet?.id],
    { onError: (err) => console.error('获取成长记录失败', err) },
  );
  const growthRecords: PetGrowthRecordInfo[] = growthHook.data?.list ?? [];

  const isOwner = !!(user && pet && user.id === pet.userId);

  const uploadAlbumPhotos = async (files: FileList | File[]) => {
    if (!pet?.id || !isOwner) return;
    const list = Array.from(files).slice(0, MAX_ALBUM_BATCH);
    if (list.length === 0) return;

    const valid: File[] = [];
    for (const f of list) {
      if (f.size > MAX_ALBUM_IMAGE_BYTES) {
        showErrorToast(`${f.name} 超过 5MB，已跳过`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;

    setUploading(true);
    try {
      let ok = 0;
      for (const file of valid) {
        try {
          const uploaded = await uploadPetAlbumPhoto(file);
          await addPetAlbumPhoto(pet.id, {
            imageUrl: uploaded.url,
            mediaType: 'image',
            title: file.name.replace(/\.[^.]+$/, '').slice(0, 100),
          });
          ok += 1;
        } catch (err) {
          showErrorToast(`${file.name} 上传失败：${(err as Error).message || '请重试'}`);
        }
      }
      if (ok > 0) {
        showSuccessToast(`已添加 ${ok} 张照片`);
        await albumHook.refetch();
      }
    } finally {
      setUploading(false);
    }
  };

  const uploadAlbumVideo = async (file: File) => {
    if (!pet?.id || !isOwner) return;

    const isMp4 =
      file.type === 'video/mp4' ||
      file.name.toLowerCase().endsWith('.mp4');
    if (!isMp4) {
      showErrorToast('相册视频仅支持 MP4 格式');
      return;
    }
    if (file.size > MAX_ALBUM_VIDEO_BYTES) {
      showErrorToast('视频大小不能超过 50MB');
      return;
    }

    try {
      const duration = await readVideoDuration(file);
      if (!Number.isFinite(duration) || duration > MAX_ALBUM_VIDEO_SEC) {
        showErrorToast('视频时长不能超过 1 分钟');
        return;
      }
    } catch {
      showErrorToast('无法读取视频时长，请换一个 MP4 文件');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadPetAlbumVideo(file);
      await addPetAlbumPhoto(pet.id, {
        imageUrl: uploaded.url,
        mediaType: 'video',
        title: file.name.replace(/\.[^.]+$/, '').slice(0, 100),
      });
      showSuccessToast('视频已添加');
      await albumHook.refetch();
    } catch (err) {
      showErrorToast((err as Error).message || '视频上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeAlbumPhoto = (photoId: number) => {
    if (!pet?.id || !isOwner) return;
    run(
      () => deletePetAlbumPhoto(pet.id, photoId),
      async () => {
        showSuccessToast('已删除');
        await albumHook.refetch();
      },
      (err) => showErrorToast((err as Error).message || '删除失败'),
    );
  };

  const setAlbumCover = (imageUrl: string) => {
    if (!pet?.id || !isOwner) return;
    run(
      () => updatePet(pet.id, { avatar: imageUrl }),
      async () => {
        showSuccessToast('已设为封面');
        await petHook.refetch();
      },
      (err) => showErrorToast((err as Error).message || '设置封面失败'),
    );
  };

  const reorderAlbum = (orderedIds: number[]) => {
    if (!pet?.id || !isOwner || orderedIds.length === 0) return;
    const prev = album;
    const idMap = new Map(prev.map((item) => [item.id, item]));
    const next = orderedIds
      .map((itemId) => idMap.get(itemId))
      .filter((item): item is PetAlbumInfo => !!item);
    if (next.length !== prev.length) return;

    albumHook.setData(next);
    run(
      () => reorderPetAlbum(pet.id, orderedIds),
      () => showSuccessToast('排序已保存'),
      async (err) => {
        albumHook.setData(prev);
        showErrorToast((err as Error).message || '排序保存失败');
        await albumHook.refetch();
      },
    );
  };

  const saveGrowthRecord = (
    data: PetGrowthRecordCreateRequest,
    recordId?: number,
    onDone?: () => void,
  ) => {
    if (!pet?.id || !isOwner) return;
    const payload = {
      ...data,
      recordDate: data.recordDate.includes('T')
        ? data.recordDate
        : `${data.recordDate}T00:00:00Z`,
    };
    run(
      () =>
        recordId
          ? updateGrowthRecord(pet.id, recordId, payload)
          : createGrowthRecord(pet.id, payload),
      async () => {
        showSuccessToast(recordId ? '记录已更新' : '记录已添加');
        await growthHook.refetch();
        onDone?.();
      },
      (err) => showErrorToast((err as Error).message || '保存失败'),
    );
  };

  const removeGrowthRecord = (recordId: number) => {
    if (!pet?.id || !isOwner) return;
    run(
      () => deleteGrowthRecord(pet.id, recordId),
      async () => {
        showSuccessToast('已删除记录');
        await growthHook.refetch();
      },
      (err) => showErrorToast((err as Error).message || '删除失败'),
    );
  };

  return {
    pet,
    loading: petHook.loading,
    album,
    growthRecords,
    activeTab,
    setActiveTab,
    isOwner,
    uploading,
    mutating,
    uploadAlbumPhotos,
    uploadAlbumVideo,
    removeAlbumPhoto,
    setAlbumCover,
    reorderAlbum,
    saveGrowthRecord,
    removeGrowthRecord,
  };
}
