import { useState } from 'react';
import { pointsApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { useAdminTabQuery } from './useAdminTabQuery';
import { reportError } from '../utils/errorReport';
import {
  levelProgressPercent,
  toLevelBenefitView,
  toUserLevelView,
  type LevelBenefitApi,
  type LevelBenefitView,
  type UserLevelApi,
  type UserLevelView,
} from '../utils/pointsView';

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

export type { LevelBenefitView as LevelBenefit, UserLevelView as UserLevel };

export type PointsTab = 'records' | 'rules' | 'benefits';

const POINTS_TABS = ['records', 'rules', 'benefits'] as const;

/**
 * 积分中心 hook
 *
 * 管理:
 * - 用户等级(getUserLevel) → PointsView 适配 BE JSON
 * - 按 tab 加载 records/rules/benefits
 * - tab 与 URL ?tab= 同步
 */
export function usePoints(pageSize = 50) {
  const [activeTab, setActiveTab] = useAdminTabQuery<PointsTab>('records', POINTS_TABS);
  const [records, setRecords] = useState<PointsRecord[]>([]);
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [benefits, setBenefits] = useState<LevelBenefitView[]>([]);

  const { data: userLevelData } = useAsyncEffect(
    async () => {
      const raw = (await pointsApi.getUserLevel()) as UserLevelApi;
      return toUserLevelView(raw);
    },
    [activeTab],
    { onError: (error) => reportError('获取用户等级失败', error) },
  );
  const userLevel = userLevelData ?? null;

  const { loading } = useAsyncEffect(
    async () => {
      switch (activeTab) {
        case 'records': {
          const recordsRes = (await pointsApi.getPointsRecords({ page: 1, pageSize })) as {
            list: PointsRecord[];
          };
          setRecords(recordsRes.list || []);
          break;
        }
        case 'rules': {
          const rulesRes = (await pointsApi.getPointsRules()) as PointsRule[];
          setRules(rulesRes || []);
          break;
        }
        case 'benefits': {
          const benefitsRes = (await pointsApi.getBenefits()) as LevelBenefitApi[];
          setBenefits((benefitsRes || []).map(toLevelBenefitView));
          break;
        }
      }
    },
    [activeTab],
    {
      onError: (error) => reportError('获取数据失败', error, '获取数据失败'),
    },
  );

  const getProgress = () => {
    if (!userLevel) return 0;
    return levelProgressPercent(userLevel);
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
