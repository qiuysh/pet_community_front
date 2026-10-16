import { useEffect, useState } from 'react';
import { AdminDateTime, AdminInput, AdminSelect } from './adminField';
import { AdminFilterBar, AdminFilterField } from './adminFilterToolbar';

interface LogFilterProps {
  logType: string;
  userId: string;
  actionType: string;
  targetType: string;
  startTime: string;
  endTime: string;
  /** 回车确认后提交用户 ID 搜索 */
  onUserIdChange: (value: string) => void;
  onActionTypeChange: (value: string) => void;
  onTargetTypeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const ACTION_TYPES = [
  { value: '', label: '全部操作类型' },
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' },
  { value: 'register', label: '注册' },
  { value: 'post_create', label: '发布帖子' },
  { value: 'post_update', label: '更新帖子' },
  { value: 'post_delete', label: '删除帖子' },
  { value: 'comment_create', label: '发布评论' },
  { value: 'comment_delete', label: '删除评论' },
  { value: 'like', label: '点赞' },
  { value: 'favorite', label: '收藏' },
  { value: 'follow', label: '关注' },
  { value: 'unfollow', label: '取消关注' },
  { value: 'pet_create', label: '创建宠物' },
  { value: 'profile_update', label: '更新资料' },
  { value: 'password_change', label: '修改密码' },
];

const TARGET_TYPES = [
  { value: '', label: '全部目标类型' },
  { value: 'user', label: '用户' },
  { value: 'post', label: '帖子' },
  { value: 'comment', label: '评论' },
  { value: 'pet', label: '宠物' },
  { value: 'like', label: '点赞' },
  { value: 'favorite', label: '收藏' },
  { value: 'follow', label: '关注' },
  { value: 'activity', label: '活动' },
  { value: 'adopt', label: '领养' },
  { value: 'message', label: '消息' },
];

export function LogFilter({
  logType,
  userId,
  actionType,
  targetType,
  startTime,
  endTime,
  onUserIdChange,
  onActionTypeChange,
  onTargetTypeChange,
  onStartTimeChange,
  onEndTimeChange,
}: LogFilterProps) {
  const [userIdInput, setUserIdInput] = useState(userId);
  const showUserId = logType === 'behavior' || logType === 'security';
  const showActionType = logType === 'behavior' || logType === 'operation';
  const showTargetType = logType === 'behavior';

  useEffect(() => {
    setUserIdInput(userId);
  }, [userId]);

  return (
    <AdminFilterBar>
      {showUserId && (
        <AdminFilterField label="用户 ID" htmlFor="log-filter-user-id">
          <AdminInput
            id="log-filter-user-id"
            name="userId"
            inputMode="numeric"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onUserIdChange(userIdInput)}
            placeholder="输入用户 ID…"
            spellCheck={false}
            autoComplete="off"
          />
        </AdminFilterField>
      )}

      {showActionType && (
        <AdminFilterField label="操作类型" htmlFor="log-filter-action-type">
          <AdminSelect
            id="log-filter-action-type"
            name="actionType"
            value={actionType}
            onChange={(e) => onActionTypeChange(e.target.value)}
          >
            {ACTION_TYPES.map((option) => (
              <option key={option.value || 'all-action'} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
        </AdminFilterField>
      )}

      <div className="col-span-full grid min-w-0 grid-cols-2 gap-3 sm:col-span-2">
        <AdminFilterField label="开始时间" htmlFor="log-filter-start-time">
          <AdminDateTime
            id="log-filter-start-time"
            aria-label="开始时间"
            granularity="day"
            size="sm"
            value={startTime}
            onChange={onStartTimeChange}
          />
        </AdminFilterField>
        <AdminFilterField label="结束时间" htmlFor="log-filter-end-time">
          <AdminDateTime
            id="log-filter-end-time"
            aria-label="结束时间"
            granularity="day"
            size="sm"
            value={endTime}
            onChange={onEndTimeChange}
          />
        </AdminFilterField>
      </div>

      {showTargetType && (
        <AdminFilterField label="目标类型" htmlFor="log-filter-target-type">
          <AdminSelect
            id="log-filter-target-type"
            name="targetType"
            value={targetType}
            onChange={(e) => onTargetTypeChange(e.target.value)}
          >
            {TARGET_TYPES.map((option) => (
              <option key={option.value || 'all-target'} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
        </AdminFilterField>
      )}
    </AdminFilterBar>
  );
}
