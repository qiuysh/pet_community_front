/** 与后端 model.UserLevel / CalculateLevel（每级 200，封顶 Lv10）对齐的展示适配 */

export interface UserLevelApi {
  level: number;
  points: number;
  totalPoints?: number;
}

export interface LevelBenefitApi {
  id: number;
  level: number;
  benefitType: string;
  benefitValue?: string;
  description: string;
}

export interface UserLevelView {
  level: number;
  levelName: string;
  currentPoints: number;
  minPoints: number;
  maxPoints: number;
}

export interface LevelBenefitView {
  id: number;
  level: number;
  benefitName: string;
  benefitDesc: string;
}

const POINTS_PER_LEVEL = 200;
const MAX_LEVEL = 10;

const BENEFIT_LABELS: Record<string, string> = {
  basic: '基础功能',
  badge: '等级徽章',
  topic_create: '创建话题',
  activity_priority: '活动优先',
  nickname_style: '昵称标识',
};

/** 与 server PointsService.CalculateLevel 同口径 */
export function levelMinPoints(level: number): number {
  const lv = Math.min(Math.max(level, 1), MAX_LEVEL);
  return (lv - 1) * POINTS_PER_LEVEL;
}

export function levelMaxPoints(level: number): number {
  const lv = Math.min(Math.max(level, 1), MAX_LEVEL);
  if (lv >= MAX_LEVEL) return MAX_LEVEL * POINTS_PER_LEVEL;
  return lv * POINTS_PER_LEVEL;
}

export function toUserLevelView(raw: UserLevelApi | null | undefined): UserLevelView | null {
  if (!raw || !Number.isFinite(raw.level)) return null;
  const level = Math.min(Math.max(Math.trunc(raw.level) || 1, 1), MAX_LEVEL);
  const currentPoints = Number.isFinite(raw.points) ? raw.points : 0;
  return {
    level,
    levelName: `Lv.${level}`,
    currentPoints,
    minPoints: levelMinPoints(level),
    maxPoints: levelMaxPoints(level),
  };
}

export function toLevelBenefitView(raw: LevelBenefitApi): LevelBenefitView {
  const type = (raw.benefitType || '').trim();
  return {
    id: raw.id,
    level: raw.level,
    benefitName: BENEFIT_LABELS[type] || type || '权益',
    benefitDesc: raw.description || '',
  };
}

export function levelProgressPercent(view: UserLevelView): number {
  const span = view.maxPoints - view.minPoints;
  if (span <= 0) return 100;
  const ratio = ((view.currentPoints - view.minPoints) / span) * 100;
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(100, Math.max(0, ratio));
}
