/** 根据登录回跳路径生成墙上文案，避免「欢迎来到…」与意图脱节 */

export function getLoginContextCopy(from?: string | null): {
  titleSuffix?: string;
  subtitle: string;
} {
  const path = (from || '').split('?')[0] || '';

  if (path.startsWith('/messages')) {
    return { subtitle: '登录后继续查看私信与会话' };
  }
  if (path.startsWith('/notifications') || path.startsWith('/notification-settings')) {
    return { subtitle: '登录后继续查看互动与安全通知' };
  }
  if (path.startsWith('/posts/create') || path.startsWith('/posts/drafts')) {
    return { subtitle: '登录后继续发布或编辑动态' };
  }
  if (/^\/posts\/[^/]+\/edit$/.test(path)) {
    return { subtitle: '登录后继续编辑这篇动态' };
  }
  if (path.startsWith('/pets/create') || /^\/pets\/[^/]+\/edit$/.test(path)) {
    return { subtitle: '登录后继续发布或编辑宠物档案' };
  }
  if (path.startsWith('/adopts/create') || path.startsWith('/adopts/mine')) {
    return { subtitle: '登录后发布送养或管理我的领养' };
  }
  if (path.startsWith('/lost-pets/create')) {
    return { subtitle: '登录后发布寻宠启事' };
  }
  if (/^\/activities\/[^/]+/.test(path)) {
    return { subtitle: '登录后参与活动报名或签到' };
  }
  if (path.startsWith('/points')) {
    return { subtitle: '登录后查看积分与等级权益' };
  }
  if (path.startsWith('/follow') || path.startsWith('/blocked')) {
    return { subtitle: '登录后管理关注与粉丝' };
  }
  if (path.startsWith('/my-reports')) {
    return { subtitle: '登录后查看我的举报记录' };
  }
  if (path.startsWith('/settings') || path.startsWith('/profile')) {
    return { subtitle: '登录后进入个人中心' };
  }

  return { subtitle: '登录您的账号，与宠友分享快乐' };
}
