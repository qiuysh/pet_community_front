import { get, post, put, del } from './axios'
import type { FollowStatus } from '../types/user'

export const followApi = {
  followUser: (targetId: number, options?: { secret?: boolean }) =>
    post(`/api/v1/social/follow/${targetId}`, options ?? {}),
  unfollowUser: (targetId: number) => del(`/api/v1/social/follow/${targetId}`),
  /** 切换已存在关注的悄悄关注标记（F6） */
  setSecretFollow: (targetId: number, isSecret: boolean) =>
    post(`/api/v1/social/follow/${targetId}/secret`, { isSecret }),
  getFollowers: (userId: number, params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/social/follow/${userId}/followers`, { params }),
  getFollowing: (userId: number, params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/social/follow/${userId}/following`, { params }),
  /** 悄悄关注列表（仅自己可见，F6-02） */
  getSecretFollowing: (params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/social/follow/secret/list`, { params }),
  /** 关注状态：isFollowing / isSecret / isMutual + 计数 */
  getFollowStatus: (targetId: number) => get<FollowStatus>(`/api/v1/social/follow/status/${targetId}`),
}

export const blockApi = {
  blockUser: (targetId: number) => post(`/api/v1/social/block/${targetId}`),
  unblockUser: (targetId: number) => del(`/api/v1/social/block/${targetId}`),
  getBlockedList: (params?: { page?: number; pageSize?: number }) =>
    get('/api/v1/social/block/list', { params }),
}

export const messageApi = {
  sendMessage: (data: { toId: number; content: string; type?: string }) =>
    post('/api/v1/social/messages/send', data),
  getConversations: (params?: { page?: number; pageSize?: number }) =>
    get('/api/v1/social/messages/conversations', { params }),
  getMessages: (conversationId: number, params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/social/messages/${conversationId}`, { params }),
  markAsRead: (conversationId: number) =>
    post(`/api/v1/social/messages/${conversationId}/read`),
  deleteConversation: (conversationId: number) =>
    del(`/api/v1/social/messages/${conversationId}`),
  searchMessages: (conversationId: number, keyword: string) =>
    get(`/api/v1/social/messages/${conversationId}/search`, { params: { keyword } }),
  recallMessage: (msgId: number) =>
    post(`/api/v1/social/messages/recall/${msgId}`),
  getUnreadCount: () => get('/api/v1/social/messages/unread/count'),
}

export const pointsApi = {
  getUserLevel: () => get('/api/v1/social/points/level'),
  getPointsRecords: (params?: { page?: number; pageSize?: number }) =>
    get('/api/v1/social/points/records', { params }),
  getPointsRules: () => get('/api/v1/social/points/rules'),
  getBenefits: () => get('/api/v1/social/points/benefits'),
  getBenefitsByLevel: (level: number) => get(`/api/v1/social/points/benefits/${level}`),
}

export const notificationSettingsApi = {
  getSettings: () => get('/api/v1/social/notification-settings'),
  updateSettings: (data: {
    likeNotify: number
    commentNotify: number
    atNotify: number
    followNotify: number
    systemNotify: number
  }) => put('/api/v1/social/notification-settings', data),
}

export const userStatusApi = {
  getOnlineStatus: (userId: number) => get(`/api/v1/social/status/online/${userId}`),
  setOnlineStatus: (status: 'online' | 'offline') => post('/api/v1/social/status/online', { status }),
}

export const likeListApi = {
  getPostLikes: (postId: number, params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/posts/${postId}/likes`, { params }),
  getCommentLikes: (commentId: number, params?: { page?: number; pageSize?: number }) =>
    get(`/api/v1/posts/comments/${commentId}/likes`, { params }),
}

// 通知列表(通知中心页使用)
export const notificationApi = {
  getNotifications: (params?: { page?: number; pageSize?: number }) =>
    get('/api/v1/notifications', { params }),
  markAsRead: (id: number) => post(`/api/v1/notifications/${id}/read`),
  markAllAsRead: () => post('/api/v1/notifications/read-all'),
}

// 用户维度关注列表(followListPage 按 userId 查询关注/粉丝)
export const userFollowApi = {
  getFollowListByUser: async (
    userId: number,
    params?: { page?: number; pageSize?: number; type?: string },
  ) => {
    const type = params?.type === 'followers' ? 'followers' : 'following';
    const query = { page: params?.page, pageSize: params?.pageSize };
    if (type === 'followers') {
      return followApi.getFollowers(userId, query);
    }
    return followApi.getFollowing(userId, query);
  },
  followUser: (targetId: number, options?: { secret?: boolean }) => followApi.followUser(targetId, options),
  unfollowUser: (targetId: number) => followApi.unfollowUser(targetId),
  setSecretFollow: (targetId: number, isSecret: boolean) => followApi.setSecretFollow(targetId, isSecret),
}