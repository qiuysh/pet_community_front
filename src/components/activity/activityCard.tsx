import { Link } from 'react-router-dom';
import { ActivityInfo, ActivityStatus, ActivityType } from '../../types/activity';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Check } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityInfo;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const getStatusLabel = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.DRAFT:
        return { text: '草稿', color: 'bg-muted text-brown-muted' };
      case ActivityStatus.PUBLISHED:
        return { text: '已发布', color: 'bg-primary-soft text-primary-dark' };
      case ActivityStatus.ONGOING:
        return { text: '进行中', color: 'bg-secondary-soft text-secondary-dark' };
      case ActivityStatus.ENDED:
        return { text: '已结束', color: 'bg-muted text-brown-muted' };
      case ActivityStatus.CANCELLED:
        return { text: '已取消', color: 'bg-error/10 text-error-dark' };
      default:
        return { text: '未知', color: 'bg-muted text-brown-muted' };
    }
  };

  const getTypeLabel = (type: ActivityType) => {
    switch (type) {
      case ActivityType.ONLINE_VOTE:
        return '线上投票';
      case ActivityType.OFFLINE_EVENT:
        return '线下活动';
      case ActivityType.ADOPTION:
        return '领养活动';
      default:
        return '其他';
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusInfo = getStatusLabel(activity.status);

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
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-brown-muted">{getTypeLabel(activity.type)}</span>
          {activity.maxParticipants && (
            <span className="text-xs text-brown-muted">
              {activity.currentParticipants}/{activity.maxParticipants} 人
            </span>
          )}
        </div>

        <h3 className="text-base font-medium text-brown mb-2 line-clamp-2">
          {activity.title}
        </h3>

        <p className="text-sm text-brown-muted mb-3 line-clamp-2">
          {activity.description}
        </p>

        <div className="flex items-center justify-between text-xs text-brown-muted">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(activity.startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src={activity.organizerAvatar || getDefaultUserAvatar()}
              alt=""
              className="w-4 h-4 rounded-full"
            />
            <span>{activity.organizerName}</span>
          </div>
        </div>

        {activity.isRegistered && (
          <div className="mt-2 text-xs text-secondary-dark flex items-center gap-1">
            <Check size={12} aria-hidden="true" />
            <span>已报名</span>
          </div>
        )}
      </div>
    </Link>
  );
};