import { Link } from 'react-router-dom';
import {
  ActivityInfo,
  ActivityType,
  ActivityTypeOptions,
  getActivityDisplayStatus,
} from '../../types/activity';

interface ActivityCardProps {
  activity: ActivityInfo;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const display = getActivityDisplayStatus(activity);

  const statusMeta = (() => {
    switch (display) {
      case 'draft':
        return { text: '草稿', color: 'bg-muted text-brown-muted' };
      case 'upcoming':
        return { text: '即将开始', color: 'bg-primary-soft text-primary-dark' };
      case 'active':
        return { text: '进行中', color: 'bg-secondary-soft text-secondary-dark' };
      case 'ended':
        return { text: '已结束', color: 'bg-muted text-brown-muted' };
      default:
        return { text: '未知', color: 'bg-muted text-brown-muted' };
    }
  })();

  const typeLabel =
    ActivityTypeOptions.find((o) => o.value === activity.type)?.label ||
    (activity.type === ActivityType.VOTING ? '投票评选' : '活动');

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="block bg-white rounded-md shadow-card hover:shadow-hover transition-shadow duration-200"
    >
      <div className="relative">
        <img
          src={activity.cover || '/default-activity-cover.png'}
          alt={activity.title}
          className="w-full h-40 object-cover rounded-t-md"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${statusMeta.color}`}>
          {statusMeta.text}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-brown-muted">{typeLabel}</span>
          {(activity.maxParticipants ?? 0) > 0 && (
            <span className="text-xs text-brown-muted">
              {activity.participantsCount}/{activity.maxParticipants} 人
            </span>
          )}
        </div>

        <h3 className="text-base font-medium text-brown mb-2 line-clamp-2">{activity.title}</h3>

        <p className="text-sm text-brown-muted mb-3 line-clamp-2">{activity.description}</p>

        <div className="flex items-center justify-between text-xs text-brown-muted">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
            </span>
          </div>
          {activity.isRegistered && <span className="text-secondary">已报名</span>}
        </div>
      </div>
    </Link>
  );
};
