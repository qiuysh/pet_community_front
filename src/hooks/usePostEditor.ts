import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createPost,
  updatePost,
  getPostDetail,
  createDraft,
  updateDraft,
  getDraftDetail,
  cancelPostSchedule,
} from '../api/post';
import { getMyPets } from '../api/pet';
import { getPrivacySettings } from '../api/user';
import { useToast } from '../components/toast';
import { useUserStore } from '../stores/userStore';
import { useAsync } from './useAsync';
import {
  PostCreateRequest,
  PostUpdateRequest,
  TopicInfo,
} from '../types/post';
import { PetInfo } from '../types/pet';
import { getDefaultScheduleTime, toScheduleValue } from '../components/post/schedulePicker';

// 将 RFC3339 字符串转换为本地时间格式 (YYYY-MM-DDTHH:mm)。
export const toLocalDatetimeInput = (rfc3339: string): string => {
  const d = new Date(rfc3339);
  if (Number.isNaN(d.getTime())) return '';
  return toScheduleValue(d);
};

// 将 datetime-local 的值转换为 RFC3339 字符串(本地时区)。
export const fromLocalDatetimeInput = (local: string): string => {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
};

export type PublishMode = 'now' | 'scheduled';

export interface PostEditorState {
  content: string;
  images: string[];
  video: string;
  selectedPets: number[];
  selectedTopics: TopicInfo[];
  location: string;
  visibility: number;
  publishMode: PublishMode;
  publishTime: string;
}

export const initialEditorState: PostEditorState = {
  content: '',
  images: [],
  video: '',
  selectedPets: [],
  selectedTopics: [],
  location: '',
  visibility: 0,
  publishMode: 'now',
  publishTime: '',
};

/**
 * 动态编辑器 hook
 *
 * 封装动态编辑/发布/草稿的全部业务逻辑:
 * - 加载当前用户宠物列表
 * - 编辑模式:加载动态详情回填表单
 * - 草稿模式:加载草稿详情回填表单
 * - 发布:校验 + 定时校验 + createPost/updatePost
 * - 保存草稿:createDraft/updateDraft
 *
 * 用法:
 *   const editor = usePostEditor();
 *   editor.setContent('...');  // 表单状态
 *   await editor.publish();    // 发布
 */
export function usePostEditor() {
  const navigate = useNavigate();
  const { id, draftId } = useParams();
  const { isLoggedIn } = useUserStore();
  const toast = useToast();

  const isEdit = !!id;
  const isFromDraft = !!draftId;

  const [state, setState] = useState<PostEditorState>(initialEditorState);
  const [myPets, setMyPets] = useState<PetInfo[]>([]);
  const [autoDraftId, setAutoDraftId] = useState<number | null>(
    draftId ? Number(draftId) : null,
  );
  const [autoSaveHint, setAutoSaveHint] = useState('');
  const lastAutoSnapshot = useRef('');
  const autoSaving = useRef(false);

  const { loading, run } = useAsync();
  const { run: runBg } = useAsync();

  // 表单字段更新器
  const update = useCallback(<K extends keyof PostEditorState>(key: K, value: PostEditorState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setContent = useCallback((v: string) => update('content', v), [update]);
  const setImages = useCallback((v: string[]) => update('images', v), [update]);
  const setVideo = useCallback((v: string) => update('video', v), [update]);
  const setSelectedPets = useCallback((v: number[]) => update('selectedPets', v), [update]);
  const setSelectedTopics = useCallback((v: TopicInfo[]) => update('selectedTopics', v), [update]);
  const setLocation = useCallback((v: string) => update('location', v), [update]);
  const setVisibility = useCallback((v: number) => update('visibility', v), [update]);
  const setPublishMode = useCallback((v: PublishMode) => {
    setState((s) => {
      if (v === 'scheduled' && !s.publishTime) {
        // 默认约 1 小时后，避免用户对着空的时间选择器无从下手
        return { ...s, publishMode: v, publishTime: getDefaultScheduleTime() };
      }
      return { ...s, publishMode: v };
    });
  }, []);
  const setPublishTime = useCallback((v: string) => update('publishTime', v), [update]);

  const loadMyPets = useCallback(() => {
    runBg(
      () => getMyPets(),
      (res) => setMyPets(res),
      (e) => console.error('加载宠物失败', e),
    );
  }, [runBg]);

  const applyPostData = useCallback((res: import('../types/post').PostInfo) => {
    setState({
      content: res.content,
      images: res.images || [],
      video: res.video || '',
      selectedPets: res.petIds || [],
      selectedTopics: res.topics || [],
      location: res.location || '',
      visibility: res.visibility,
      publishMode: res.publishAt ? 'scheduled' : 'now',
      publishTime: res.publishAt ? toLocalDatetimeInput(res.publishAt) : '',
    });
  }, []);

  const applyDraftData = useCallback((res: import('../types/post').DraftInfo) => {
    setState((s) => ({
      ...s,
      content: res.content,
      images: res.images || [],
      video: res.video || '',
      selectedPets: res.petIds || [],
      location: res.location || '',
      visibility: res.visibility,
    }));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadMyPets();

    if (isEdit && id) {
      runBg(
        () => getPostDetail(Number(id)),
        applyPostData,
        (e: unknown) => {
          toast.error((e as Error).message || '加载失败');
          navigate(-1);
        },
      );
    } else if (isFromDraft && draftId) {
      runBg(
        () => getDraftDetail(Number(draftId)),
        applyDraftData,
        (e: unknown) => {
          toast.error((e as Error).message || '加载失败');
          navigate(-1);
        },
      );
    } else {
      // 新建：预填 U8 默认可见范围
      runBg(
        () => getPrivacySettings(),
        (privacy) => {
          if (typeof privacy.postVisibility === 'number') {
            setVisibility(privacy.postVisibility);
          }
        },
        (e) => console.error('加载默认可见范围失败', e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 校验定时发布时间,返回 RFC3339 字符串(立即发布返回 undefined)
   * 校验失败返回 { error: string }
   */
  const validatePublishAt = (): { value?: string; error?: string } => {
    if (state.publishMode !== 'scheduled') return {};
    if (!state.publishTime) return { error: '请选择定时发布时间' };
    const scheduledAt = fromLocalDatetimeInput(state.publishTime);
    if (!scheduledAt) return { error: '定时发布时间格式错误' };
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    if (scheduledDate.getTime() <= now.getTime()) {
      return { error: '定时发布时间不能早于当前时间' };
    }
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (scheduledDate.getTime() > sevenDaysLater.getTime()) {
      return { error: '定时发布时间最多延迟7天' };
    }
    return { value: scheduledAt };
  };

  const validateContent = (): string | undefined => {
    if (!state.content.trim() && state.images.length === 0 && !state.video) {
      return '请添加内容';
    }
    if (state.images.length > 0 && state.video) {
      return '图文和视频不能同时发布';
    }
    return undefined;
  };

  const publish = useCallback(async () => {
    const contentError = validateContent();
    if (contentError) {
      toast.error(contentError);
      return false;
    }
    const { value: publishAt, error: publishError } = validatePublishAt();
    if (publishError) {
      toast.error(publishError);
      return false;
    }

    const data: PostCreateRequest & PostUpdateRequest = {
      content: state.content.trim(),
      images: state.images,
      video: state.video,
      petIds: state.selectedPets,
      topicIds: state.selectedTopics.map((t) => t.id),
      location: state.location,
      visibility: state.visibility,
      publishAt,
    };

    let success = false;
    await run(
      async () => {
        if (isEdit && id) {
          await updatePost(Number(id), data);
          return 'edit' as const;
        }
        await createPost(data);
        return 'create' as const;
      },
      (mode) => {
        const action = mode === 'edit' ? '更新' : '发布';
        toast.success(state.publishMode === 'scheduled' ? `已设置定时${action}` : `${action}成功`);
        navigate(-1);
        success = true;
      },
      (e: unknown) => toast.error((e as Error).message || '操作失败'),
    );
    return success;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, id, isEdit, run, toast, navigate]);

  const saveDraft = useCallback(async () => {
    const contentError = validateContent();
    if (contentError) {
      toast.error(contentError);
      return false;
    }

    const data = {
      content: state.content,
      images: state.images,
      video: state.video,
      petIds: state.selectedPets,
      topicIds: state.selectedTopics.map((t) => t.id),
      location: state.location,
      visibility: state.visibility,
    };

    let success = false;
    await run(
      async () => {
        if (autoDraftId || (isFromDraft && draftId)) {
          const id = autoDraftId || Number(draftId);
          await updateDraft(id, data);
          return id;
        }
        const created = await createDraft(data);
        setAutoDraftId(created.id);
        return created.id;
      },
      () => {
        toast.success('已保存到草稿');
        navigate(-1);
        success = true;
      },
      (e: unknown) => toast.error((e as Error).message || '保存失败'),
    );
    return success;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, draftId, isFromDraft, run, toast, navigate]);

  // D8-01：新建/草稿编辑时每 30 秒自动保存（不跳转）
  useEffect(() => {
    if (isEdit) return;

    const tick = async () => {
      if (autoSaving.current || !isLoggedIn) return;
      const hasContent =
        !!state.content.trim() || state.images.length > 0 || !!state.video;
      if (!hasContent) return;

      const snapshot = JSON.stringify({
        content: state.content,
        images: state.images,
        video: state.video,
        selectedPets: state.selectedPets,
        selectedTopics: state.selectedTopics.map((t) => t.id),
        location: state.location,
        visibility: state.visibility,
      });
      if (snapshot === lastAutoSnapshot.current) return;

      autoSaving.current = true;
      const data = {
        content: state.content,
        images: state.images,
        video: state.video,
        petIds: state.selectedPets,
        topicIds: state.selectedTopics.map((t) => t.id),
        location: state.location,
        visibility: state.visibility,
      };
      try {
        if (autoDraftId) {
          await updateDraft(autoDraftId, data);
        } else {
          const created = await createDraft(data);
          setAutoDraftId(created.id);
          if (!draftId) {
            navigate(`/posts/drafts/${created.id}`, { replace: true });
          }
        }
        lastAutoSnapshot.current = snapshot;
        setAutoSaveHint(`已自动保存 ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        console.error('自动保存草稿失败', e);
      } finally {
        autoSaving.current = false;
      }
    };

    const timer = window.setInterval(() => {
      void tick();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [isEdit, isLoggedIn, state, autoDraftId, draftId, navigate]);

  /** 取消定时并转为草稿（仅编辑已定时帖） */
  const cancelSchedule = useCallback(async () => {
    if (!isEdit || !id) {
      toast.error('仅已定时的动态可取消');
      return false;
    }
    let success = false;
    await run(
      () => cancelPostSchedule(Number(id)),
      (draft) => {
        toast.success('已取消定时并转入草稿');
        navigate(`/posts/drafts/${draft.id}`, { replace: true });
        success = true;
      },
      (e: unknown) => toast.error((e as Error).message || '取消失败'),
    );
    return success;
  }, [isEdit, id, run, toast, navigate]);

  return {
    isEdit,
    isFromDraft,
    state,
    myPets,
    loading,
    // 表单更新
    setContent,
    setImages,
    setVideo,
    setSelectedPets,
    setSelectedTopics,
    setLocation,
    setVisibility,
    setPublishMode,
    setPublishTime,
    // 操作
    publish,
    saveDraft,
    cancelSchedule,
    autoSaveHint,
  };
}
