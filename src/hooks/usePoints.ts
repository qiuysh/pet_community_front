import { useState } from 'react';
import { pointsApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { showErrorToast } from '../utils/toastManager';

export interface PointsRecord {
  id: number;
  userID: number;
  points: number;
  balance: number;
  type: string;
  targetID: number;
  description: string;
  createdAt: string;
}

export interface PointsRule {
  id: number;
  type: string;
  points: number;
  description: string;
  isActive: number;
  dailyLimit: number;
}

export interface LevelBenefit {
  id: number;
  level: number;
  benefitName: string;
  benefitDesc: string;
  icon: string;
}

export interface UserLevel {
  level: number;
  levelName: string;
  minPoints: number;
  maxPoints: number;
  currentPoints: number;
}

export type PointsTab = 'records' | 'rules' | 'benefits';

/**
 * 积分中心 hook
 *
 * 管理:
 * - 用户等级(getUserLevel)
 * - 按 tab 加载 records/rules/benefits
 *
 * 用法:
 *   const { userLevel, records, rules, benefits, loading, activeTab, setActiveTab } = usePoints();
 */
export function usePoints(pageSize = 50) {
  const [activeTab, setActiveTab] = useState<PointsTab>('records');
  const [records, setRecords] = useState<PointsRecord[]>([]);
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [benefits, setBenefits] = useState<LevelBenefit[]>([]);

  const { data: userLevelData } = useAsyncEffect(
    () => pointsApi.getUserLevel() as Promise<UserLevel>,
    [activeTab],
    { onError: (error) => console.error('获取用户等级失败', error) },
  );
  const userLevel = userLevelData ?? null;

  const { loading } = useAsyncEffect(
    async () => {
      switch (activeTab) {
        case 'records': {
          const recordsRes = await pointsApi.getPointsRecords({ page: 1, pageSize }) as { list: PointsRecord[] };
          setRecords(recordsRes.list || []);
          break;
        }
        case 'rules': {
          const rulesRes = await pointsApi.getPointsRules() as PointsRule[];
          setRules(rulesRes || []);
          break;
        }
        case 'benefits': {
          const benefitsRes = await pointsApi.getBenefits() as LevelBenefit[];
          setBenefits(benefitsRes || []);
          break;
        }
      }
    },
    [activeTab],
    { onError: (error) => {
      console.error('获取数据失败', error);
      showErrorToast('获取数据失败');
    } },
  );

  const getProgress = () => {
    if (!userLevel) return 0;
    return ((userLevel.currentPoints - userLevel.minPoints) / (userLevel.maxPoints - userLevel.minPoints)) * 100;
  };

  return {
    userLevel,
    records,
    rules,
    benefits,
    loading,
    activeTab,
    setActiveTab,
    getProgress,
  };
}
