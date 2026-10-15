import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAdoptDetail } from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { AdoptInfo, AdoptionApplicationInfo } from '../types/adopt';

/**
 * 领养详情 hook
 *
 * 加载详情,管理申请表单/审核弹窗显隐,操作成功后刷新。
 *
 * 用法:
 *   const { adopt, loading, showApplyForm, setShowApplyForm, handleApplySuccess, handleReviewSuccess } = useAdoptDetail();
 */
export function useAdoptDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentApplication] = useState<AdoptionApplicationInfo | null>(null);

  const { loading, data: adopt, refetch } = useAsyncEffect(
    async () => {
      if (!id) return undefined;
      return await getAdoptDetail(parseInt(id));
    },
    [id],
    { onError: () => toast.error('加载领养详情失败') },
  );

  const handleApplySuccess = (_application: AdoptionApplicationInfo) => {
    setShowApplyForm(false);
    toast.success('申请已提交，请等待审核');
    refetch();
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    toast.success('审核成功');
    refetch();
  };

  return {
    adopt: adopt as AdoptInfo | undefined,
    loading,
    refetch,
    showApplyForm,
    setShowApplyForm,
    showReviewModal,
    setShowReviewModal,
    currentApplication,
    handleApplySuccess,
    handleReviewSuccess,
  };
}
