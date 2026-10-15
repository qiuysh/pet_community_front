import { useState } from 'react';
import { getAlbumPhotoList, uploadAlbumPhoto, deleteAlbumPhoto } from '../../api/activity';
import { AlbumPhotoInfo, AlbumPhotoCreateRequest } from '../../types/activity';
import { useUserStore } from '../../stores/userStore';
import { useToast } from '../../components/toast';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { useAsync, useAsyncEffect } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Input, Textarea } from '../ui/input';
import { Modal } from '../ui/modal';
import { Spinner } from '../ui/spinner';

interface ActivityAlbumProps {
  activityId: number;
  canUpload?: boolean;
}

export const ActivityAlbum = ({ activityId, canUpload = false }: ActivityAlbumProps) => {
  const toast = useToast();
  const { user } = useUserStore();
  const [photos, setPhotos] = useState<AlbumPhotoInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState<AlbumPhotoCreateRequest>({
    activityId,
    photoUrl: '',
    description: '',
  });
  const { loading, refetch: refetchPhotos } = useAsyncEffect(
    () => getAlbumPhotoList(activityId, 1, page, 20),
    [activityId, page],
    {
      onSuccess: (result) => {
        setPhotos(result.list);
        setTotal(result.total);
      },
      onError: (err) => toast.error((err as Error).message || '加载照片失败'),
    },
  );
  const { loading: uploading, run: runUpload } = useAsync();
  const { run: runDelete } = useAsync();

  const handleUpload = () => {
    if (!uploadData.photoUrl) {
      toast.warning('请输入照片URL');
      return;
    }

    runUpload(
      () => uploadAlbumPhoto(activityId, uploadData),
      () => {
        toast.success('照片上传成功');
        setShowUploadModal(false);
        setUploadData({ activityId, photoUrl: '', description: '' });
        refetchPhotos();
      },
      (err) => toast.error((err as Error).message || '上传失败'),
    );
  };

  const handleDelete = (photoId: number) => {
    runDelete(
      () => deleteAlbumPhoto(activityId, photoId),
      () => {
        toast.success('照片已删除');
        refetchPhotos();
      },
      (err) => toast.error((err as Error).message || '删除失败'),
    );
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-brown">活动相册</h3>
        {canUpload && (
          <Button type="button" size="sm" onClick={() => setShowUploadModal(true)}>
            上传照片
          </Button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="py-8 text-center text-brown-muted">暂无照片</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.photoUrl}
                alt={photo.description || '活动照片'}
                className="w-full h-32 object-cover rounded-lg"
              />
              {photo.description && (
                <div className="mt-2 text-xs text-brown-muted line-clamp-2">{photo.description}</div>
              )}
              <div className="mt-1 flex items-center gap-1">
                <img
                  src={photo.userAvatar || getDefaultUserAvatar()}
                  alt=""
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-brown-muted">{photo.userNickname}</span>
                <span className="text-xs text-brown-light ml-1">{formatTime(photo.createdAt)}</span>
              </div>
              {canUpload && user?.id === photo.userId && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 opacity-80 hover:opacity-100 min-h-0 h-auto py-1 px-2 text-xs"
                >
                  删除
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="text-sm text-brown-muted">{page}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= total}
          >
            下一页
          </Button>
        </div>
      )}

      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="上传照片"
        size="md"
        footer={
          <Button type="button" block loading={uploading} onClick={handleUpload}>
            上传
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel>照片URL</FieldLabel>
            <Input
              type="text"
              value={uploadData.photoUrl}
              onChange={(e) => setUploadData({ ...uploadData, photoUrl: e.target.value })}
              placeholder="请输入照片URL"
            />
          </div>
          <div>
            <FieldLabel>照片描述</FieldLabel>
            <Textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              placeholder="照片描述（可选）"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
