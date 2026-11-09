import { useState } from 'react';
import { pinPost, featurePost } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { adminUi } from '../../styles/adminUi';
import { AdminButton } from './adminButton';

interface PostPinActionProps {
  postId: number;
  onSuccess?: () => void;
}

/** 内容审核页的置顶/精选操作（I7）：以本地状态记录当前标记，支持再次点击取消。 */
export function PostPinAction({ postId, onSuccess }: PostPinActionProps) {
  const [pinned, setPinned] = useState(false);
  const [featured, setFeatured] = useState(false);
  const { loading, run } = useAsync();

  const togglePin = () => {
    const value: 0 | 1 = pinned ? 0 : 1;
    run(
      () => pinPost(postId, value),
      () => {
        setPinned(value === 1);
        showSuccessToast(value === 1 ? '已置顶' : '已取消置顶');
        onSuccess?.();
      },
      (err) => showErrorToast((err as Error).message || '置顶操作失败'),
    );
  };

  const toggleFeature = () => {
    const value: 0 | 1 = featured ? 0 : 1;
    run(
      () => featurePost(postId, value),
      () => {
        setFeatured(value === 1);
        showSuccessToast(value === 1 ? '已设为精选' : '已取消精选');
        onSuccess?.();
      },
      (err) => showErrorToast((err as Error).message || '精选操作失败'),
    );
  };

  return (
    <div className={adminUi.actions}>
      <AdminButton
        type="button"
        variant="ghost"
        disabled={loading}
        onClick={togglePin}
        className={adminUi.actionWarning}
        aria-label={pinned ? '取消置顶' : '置顶动态'}
      >
        {pinned ? '取消置顶' : '置顶'}
      </AdminButton>
      <AdminButton
        type="button"
        variant="ghost"
        disabled={loading}
        onClick={toggleFeature}
        className={adminUi.actionWarning}
        aria-label={featured ? '取消精选' : '设为精选'}
      >
        {featured ? '取消精选' : '精选'}
      </AdminButton>
    </div>
  );
}
