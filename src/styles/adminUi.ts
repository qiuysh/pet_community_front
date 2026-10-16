/**
 * 管理后台统一样式片段（蜜桃·青竹）
 * - 壳层强调色：secondary（青竹）
 * - 控件圆角：sm(8px)；卡片/面板：md(12px)
 * - 徽章可用 rounded-full
 */

const controlBase =
  'w-full h-10 px-3 border border-border rounded-sm text-sm text-brown bg-white ' +
  'placeholder:text-brown-muted transition-colors ' +
  'hover:border-secondary/40 ' +
  'focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary ' +
  'disabled:bg-muted disabled:text-brown-muted disabled:cursor-not-allowed disabled:hover:border-border';

const selectChevron =
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%238B929A%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')] " +
  'bg-no-repeat bg-[length:1rem] bg-[right_0.75rem_center]';

const actionBase =
  'inline-flex items-center justify-center px-1.5 py-1 text-sm font-medium bg-transparent transition-colors ' +
  'focus:outline-none focus-visible:underline ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const adminUi = {
  page: 'bg-white rounded-md shadow-card animate-fadeIn',
  panel: 'bg-white rounded-md shadow-card',

  /**
   * 页头：上行为标题 + 主操作，有分区 Tabs 时独占下一行，避免与按钮挤在右上角。
   */
  pageHeader: 'flex flex-col gap-3 px-6 py-4 border-b border-border-light',
  pageHeaderTop: 'flex flex-row items-start justify-between gap-3',
  /** 后台页标题：20px（! 覆盖 global.scss 未入 layer 的 h1=28px） */
  pageTitle: '!text-[20px] font-semibold leading-snug text-brown text-balance',
  /** 分区标题（h2）：16px，小于页标题 */
  sectionTitle: '!text-[16px] font-semibold leading-snug text-brown text-balance',
  /** 卡片/图表块标题（h3）：14px，小于分区标题 */
  blockTitle: '!text-sm font-semibold leading-snug text-brown text-balance',
  pageDesc: 'mt-1 text-sm text-brown-muted',
  /** 主操作区：始终靠右，与 Tabs 分行 */
  pageHeaderActions: 'flex shrink-0 flex-wrap items-center gap-2 sm:justify-end',
  /** 分区 Tabs 行：全宽，窄屏可横向滚动 */
  pageHeaderTabs: 'min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  /** 图表/指标卡外壳：铺满网格/弹性子项 */
  chartCard: 'w-full min-w-0 !bg-white rounded-md shadow-card border border-border-light/60 p-5',

  /**
   * 筛选区：扁平贴在页头与表格之间，禁止再套 soft 卡片。
   * 与表格同属一张 page 卡，避免割裂。
   */
  filterSection: 'px-6 py-4 border-b border-border-light',
  /** 筛选项固定网格（各页勿再覆盖） */
  filterFields: 'grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  filterFieldLabel: 'mb-0 shrink-0 whitespace-nowrap text-xs text-brown-muted',
  /** @deprecated 已扁平化，勿再用于列表筛选 */
  filterPanel: 'rounded-md border border-border-light bg-soft/60 p-4',

  btnPrimary:
    'inline-flex items-center justify-center h-10 px-4 rounded-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnSecondary:
    'inline-flex items-center justify-center h-10 px-4 rounded-sm text-sm font-medium text-brown-secondary bg-soft hover:bg-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnDanger:
    'inline-flex items-center justify-center h-10 px-4 rounded-sm text-sm font-medium text-white bg-error hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost: `${actionBase} text-brown-secondary hover:text-brown`,

  /** 筛选 / 分段 Tab */
  tab: 'px-4 py-2 rounded-sm text-sm font-medium transition-colors',
  tabActive: 'bg-secondary-soft text-secondary-dark',
  tabInactive: 'bg-soft text-brown-secondary hover:bg-muted',

  /** 文本输入 */
  input: controlBase,
  /** 下拉：统一高度、自定义箭头、可点光标 */
  select: `${controlBase} appearance-none cursor-pointer pr-10 ${selectChevron}`,
  /** 时间：与输入同高，日历指示器可交互 */
  datetime:
    `${controlBase} cursor-pointer ` +
    '[&::-webkit-calendar-picker-indicator]:cursor-pointer ' +
    '[&::-webkit-calendar-picker-indicator]:opacity-50 ' +
    'hover:[&::-webkit-calendar-picker-indicator]:opacity-100 ' +
    '[&::-webkit-calendar-picker-indicator]:transition-opacity',
  textarea:
    'w-full min-h-[6rem] px-3 py-2.5 border border-border rounded-sm text-sm text-brown bg-white ' +
    'placeholder:text-brown-muted transition-colors resize-none ' +
    'hover:border-secondary/40 ' +
    'focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary ' +
    'disabled:bg-muted disabled:text-brown-muted disabled:cursor-not-allowed',
  label: 'block text-sm font-medium text-brown-secondary mb-1.5',
  hint: 'mt-1 text-xs text-brown-muted',
  controlInvalid: 'border-error hover:border-error focus:ring-error/20 focus:border-error',

  /** 表格行内操作（无背景，仅文字色） */
  actions: 'inline-flex items-center gap-3 flex-wrap',
  action: actionBase,
  actionNeutral: `${actionBase} text-brown-secondary hover:text-brown`,
  actionPrimary: `${actionBase} text-secondary hover:text-secondary-dark`,
  actionSuccess: `${actionBase} text-success hover:text-success/80`,
  actionWarning: `${actionBase} text-warning hover:text-warning/80`,
  actionDanger: `${actionBase} text-error hover:text-error/80`,

  badge: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn overscroll-contain',
  modal: 'bg-white rounded-md p-6 max-w-md w-full mx-4 shadow-card overscroll-contain',
  modalDialog: 'bg-white rounded-md shadow-hover w-full max-w-md mx-4 animate-scaleIn overscroll-contain',

  th: 'px-6 py-3 text-left text-xs font-medium text-brown-muted tracking-wider whitespace-nowrap',
  tableHead: 'bg-soft',
  tableRow: 'hover:bg-soft/50 transition-colors',
} as const;

export type AdminActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export function adminTabClass(active: boolean): string {
  return `${adminUi.tab} ${active ? adminUi.tabActive : adminUi.tabInactive}`;
}

export function adminActionClass(tone: AdminActionTone = 'neutral'): string {
  switch (tone) {
    case 'primary':
      return adminUi.actionPrimary;
    case 'success':
      return adminUi.actionSuccess;
    case 'warning':
      return adminUi.actionWarning;
    case 'danger':
      return adminUi.actionDanger;
    default:
      return adminUi.actionNeutral;
  }
}

export function adminControlClass(
  kind: 'input' | 'select' | 'datetime' | 'textarea' = 'input',
  invalid = false,
): string {
  const base =
    kind === 'select'
      ? adminUi.select
      : kind === 'datetime'
        ? adminUi.datetime
        : kind === 'textarea'
          ? adminUi.textarea
          : adminUi.input;
  return invalid ? `${base} ${adminUi.controlInvalid}` : base;
}
