import { Link } from 'react-router-dom';
import {
  FileText,
  Flag,
  Image,
  Activity,
  BarChart3,
} from 'lucide-react';
import { adminUi } from '@/styles/adminUi';

interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

/** 规格 Ad5-07：审核 / 举报 / 广告 / 活动；另加分析报表作深度入口 */
const defaultActions: QuickAction[] = [
  {
    key: 'review',
    label: '内容审核',
    icon: <FileText className="h-5 w-5" aria-hidden="true" />,
    link: '/admin/reviews',
    color: 'bg-secondary-soft text-secondary',
  },
  {
    key: 'reports',
    label: '举报管理',
    icon: <Flag className="h-5 w-5" aria-hidden="true" />,
    link: '/admin/reports',
    color: 'bg-secondary-soft text-secondary',
  },
  {
    key: 'ad',
    label: '广告管理',
    icon: <Image className="h-5 w-5" aria-hidden="true" />,
    link: '/admin/ads',
    color: 'bg-secondary-soft text-secondary',
  },
  {
    key: 'activity',
    label: '活动管理',
    icon: <Activity className="h-5 w-5" aria-hidden="true" />,
    link: '/admin/activities/create',
    color: 'bg-secondary-soft text-secondary',
  },
  {
    key: 'analytics',
    label: '分析报表',
    icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />,
    link: '/admin/analytics',
    color: 'bg-muted text-brown-secondary',
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

/** 快捷操作（驾驶舱）：Link 导航，支持 Cmd/Ctrl+click */
export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className={adminUi.chartCard}>
      <h3 className={`${adminUi.blockTitle} mb-3`}>快捷操作</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.key}
            to={action.link}
            className="group flex flex-col items-center gap-2 rounded-md p-3 text-center transition-colors hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md transition-transform motion-reduce:transition-none group-hover:scale-105 motion-reduce:group-hover:scale-100 ${action.color}`}
            >
              {action.icon}
            </div>
            <span className="text-xs text-brown-secondary">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
