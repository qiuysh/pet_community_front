/**
 * 前台主导航：PC 顶栏完整展示；移动端顶栏隐藏，底栏只放高频 5 项，
 * 其余入口经顶栏「更多」补齐（见 UserHeader）。
 */
/**
 * 发现 = 策展广场（分类/热标签/热话题导购）；
 * 话题库 = 可检索的全量目录（与「发现」职责拆开，避免双「热门话题」心智冲突）；
 * 排行榜 = 按时段的热度榜。
 */
export const USER_HEADER_NAV = [
  { path: '/', label: '首页' },
  { path: '/discover', label: '发现' },
  { path: '/pets', label: '宠物' },
  { path: '/activities', label: '活动' },
  { path: '/topics', label: '话题' },
  { path: '/adopts', label: '领养' },
  { path: '/ranking', label: '排行榜' },
] as const;

/** 底栏已有：首页 / 发现 / 活动 / 领养 / 我的 —— 移动端「更多」只补缺口 */
export const USER_MOBILE_MORE_NAV = [
  { path: '/pets', label: '宠物' },
  { path: '/topics', label: '话题' },
  { path: '/ranking', label: '排行榜' },
] as const;
