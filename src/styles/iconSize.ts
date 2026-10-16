/**
 * 前台图标尺寸 Token（对齐 docs/frontend/ui-design-spec.md §4.6）
 *
 * 场景 → 尺寸，避免业务里散落 12/14/15/18 等临时值。
 */
export const ICON_SIZE = {
  /** 行内辅助：时间旁、地点、评论点赞、密级 meta */
  inline: 16,
  /** 操作按钮：动态四按钮、筛选 Chip、顶栏工具 */
  action: 20,
  /** 主导航 / 返回 / Tab */
  nav: 24,
  /** 分类头图、模块强调 */
  feature: 32,
  /** 空状态、大插画占位 */
  empty: 48,
} as const;

export type IconSizeToken = keyof typeof ICON_SIZE;
export type IconSizePx = (typeof ICON_SIZE)[IconSizeToken];

/** Lucide 线宽：小尺寸略加粗，保证可读 */
export function iconStroke(size: number): number {
  if (size <= 16) return 2.25;
  if (size <= 20) return 2;
  return 1.75;
}
