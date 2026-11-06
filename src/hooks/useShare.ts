import { useCallback, useState } from 'react';
import { useToast } from '../components/toast';

/** 分享面板需要的内容：链接 + 标题 */
export interface ShareTarget {
  url: string;
  title: string;
}

export interface UseShareOptions {
  /** 用户选定平台后上报；只在面板里选了平台才会调用，打开面板不发请求 */
  record: (platform: string) => Promise<unknown>;
  /** 分享数乐观更新：先 +1，上报失败用 -1 回滚 */
  onCountChange?: (delta: 1 | -1) => void;
  /** 打开面板时计算分享链接与标题（不访问网络） */
  resolveTarget: () => ShareTarget;
}

export interface UseShareResult {
  shareOpen: boolean;
  shareUrl: string;
  shareTitle: string;
  openShare: () => void;
  closeShare: () => void;
  onShare: (platform: string) => Promise<void>;
}

/**
 * 分享能力的唯一接缝：帖子列表 / 帖子详情 / 话题详情共用。
 *
 * 约定（三处入口必须一致）：
 * 1. 打开面板只生成本地链接，不发任何请求；
 * 2. 只有用户在面板里选定了平台，才调用 record(platform) 上报；
 * 3. 计数先乐观 +1，失败回滚 -1，并给出可见提示。
 *
 * 新增分享入口时只需实现 record / resolveTarget 两个适配器，不要另写一套 open+record+乐观更新。
 */
export function useShare({ record, onCountChange, resolveTarget }: UseShareOptions): UseShareResult {
  const toast = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [target, setTarget] = useState<ShareTarget>({ url: '', title: '' });

  const openShare = useCallback(() => {
    setTarget(resolveTarget());
    setShareOpen(true);
  }, [resolveTarget]);

  const closeShare = useCallback(() => setShareOpen(false), []);

  const onShare = useCallback(
    async (platform: string) => {
      onCountChange?.(1);
      try {
        await record(platform);
        toast.success('分享成功');
      } catch (err) {
        onCountChange?.(-1);
        toast.error((err as Error)?.message || '分享失败');
      }
    },
    [record, onCountChange, toast],
  );

  return {
    shareOpen,
    shareUrl: target.url,
    shareTitle: target.title,
    openShare,
    closeShare,
    onShare,
  };
}
