import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityDetail, getSignInList, getSignInStats, signIn } from '../api/activity';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../components/toast';
import { useAsync } from './useAsync';
import { ActivityInfo, SignInInfo, SignInStatsResponse } from '../types/activity';

export type SignInTab = 'qrcode' | 'signins';

/**
 * 活动签到 hook
 *
 * 管理:
 * - 登录校验(未登录跳转 /login)
 * - 加载活动详情 + 签到统计 + 签到列表
 * - 签到操作(扫码/输入二维码 + 可选地点)
 *
 * 用法:
 *   const { activity, signInList, signInStats, loading, isSigningIn, activeTab, setActiveTab, scanQRCode, setScanQRCode, signInLocation, setSignInLocation, handleSignIn, activityId } = useActivitySignIn();
 */
export function useActivitySignIn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const toast = useToast();
  const { loading, run: runLoad } = useAsync();
  const [activity, setActivity] = useState<ActivityInfo | null>(null);
  const [signInList, setSignInList] = useState<SignInInfo[]>([]);
  const [signInStats, setSignInStats] = useState<SignInStatsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<SignInTab>('qrcode');
  const [scanQRCode, setScanQRCode] = useState('');
  const [signInLocation, setSignInLocation] = useState('');
  const { loading: isSigningIn, run: runSignIn } = useAsync();

  const loadData = (activityId: number) => runLoad(
    async () => {
      const activityData = await getActivityDetail(activityId);
      setActivity(activityData);

      if (activityData.type !== 'offline_event') {
        toast.warning('该活动不是线下活动，无法签到');
        navigate(`/activities/${activityId}`);
        return;
      }

      const statsData = await getSignInStats(activityId);
      setSignInStats(statsData);

      const listData = await getSignInList(activityId, 1, 50);
      setSignInList(listData.list);
    },
    () => {},
    (error: unknown) => {
      toast.error((error as Error).message || '加载活动失败');
      navigate('/activities');
    },
  );

  useEffect(() => {
    if (!id) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadData(parseInt(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoggedIn]);

  const handleSignIn = () => {
    if (!scanQRCode) {
      toast.warning('请扫描二维码或输入二维码内容');
      return;
    }
    if (!id) return;

    runSignIn(
      () => signIn(parseInt(id), {
        activityId: parseInt(id),
        qrCode: scanQRCode,
        signInLocation: signInLocation || undefined,
      }),
      () => {
        toast.success('签到成功');
        setScanQRCode('');
        setSignInLocation('');
        loadData(parseInt(id));
      },
      (error: unknown) => toast.error((error as Error).message || '签到失败'),
    );
  };

  return {
    activity,
    signInList,
    signInStats,
    loading,
    isSigningIn,
    activeTab,
    setActiveTab,
    scanQRCode,
    setScanQRCode,
    signInLocation,
    setSignInLocation,
    handleSignIn,
    activityId: id,
  };
}
