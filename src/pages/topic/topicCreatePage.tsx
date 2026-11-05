import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock } from 'lucide-react';
import { createTopic } from '../../api/discovery';
import { useUserStore } from '../../stores/userStore';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { TOPIC_CREATE_MIN_LEVEL } from '../../utils/topicPolicy';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldError, FieldLabel, Input, Textarea } from '../../components/ui/input';

export function TopicCreatePage() {
  const navigate = useNavigate();
  const { user, fetchProfile, isLoggedIn } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { errors, showErrors, clearError, formRef } = useFormErrors(['name', 'description'] as const);

  // 确保用户信息（含 level）已加载
  useEffect(() => {
    if (isLoggedIn && !user) {
      void fetchProfile();
    }
  }, [isLoggedIn, user, fetchProfile]);

  const currentLevel = user?.level ?? 0;
  const levelBlocked = isLoggedIn && !!user && currentLevel < TOPIC_CREATE_MIN_LEVEL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const next: FormErrors<'name' | 'description'> = {};
    if (!trimmedName) {
      next.name = '请填写话题名称';
    } else if (trimmedName.length > 50) {
      next.name = '话题名称不超过 50 字';
    }
    if (description.length > 200) {
      next.description = '话题描述不超过 200 字';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }
    setLoading(true);
    try {
      const created = await createTopic({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      showSuccessToast('话题已提交，等待管理员审核');
      // 待审核话题不可走公开详情；回到话题广场
      navigate(`/topics/${created.id}`, { replace: true });
    } catch (err) {
      showErrorToast((err as Error).message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <BackButton className="-ml-2" />
          <h1 className="text-lg font-semibold text-brown">创建话题</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* 等级门禁提示（T5-01：须 Lv5+） */}
        {levelBlocked && (
          <Card className="mb-4 rounded-xl border border-secondary/30 bg-secondary-soft/40 p-4">
            <div className="flex items-start gap-3">
              <Lock size={20} className="mt-0.5 text-secondary" aria-hidden="true" />
              <div className="text-sm text-brown-secondary">
                <p className="font-semibold text-brown">等级不足，暂无法创建话题</p>
                <p className="mt-1">
                  创建话题需达到 <span className="font-semibold text-secondary">Lv{TOPIC_CREATE_MIN_LEVEL}+</span>，
                  当前等级 <span className="font-semibold">Lv{currentLevel}</span>。
                  继续活跃获取积分即可解锁（详见 <Link to="/points" className="text-primary underline">积分等级</Link>）。
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          <Card className="space-y-4 rounded-xl">
            <div>
              <FieldLabel htmlFor="topic-name" required>话题名称</FieldLabel>
              <Input
                id="topic-name"
                name="name"
                autoComplete="off"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                maxLength={50}
                placeholder="如：橘猫减肥打卡…"
                disabled={levelBlocked}
                invalid={!!errors.name}
                aria-describedby={errors.name ? 'topic-name-error' : 'topic-name-count'}
              />
              {errors.name ? (
                <FieldError id="topic-name-error">{errors.name}</FieldError>
              ) : (
                <p id="topic-name-count" className="mt-1 text-xs text-brown-muted">{name.length}/50</p>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="topic-description">话题描述</FieldLabel>
              <Textarea
                id="topic-description"
                name="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError('description');
                }}
                maxLength={200}
                rows={4}
                placeholder="简单介绍话题内容与参与规则…"
                disabled={levelBlocked}
                invalid={!!errors.description}
                aria-describedby={errors.description ? 'topic-description-error' : 'topic-description-count'}
              />
              {errors.description ? (
                <FieldError id="topic-description-error">{errors.description}</FieldError>
              ) : (
                <p id="topic-description-count" className="mt-1 text-xs text-brown-muted">{description.length}/200</p>
              )}
            </div>
            <div className="rounded-md bg-soft/40 p-3 text-xs text-brown-muted">
              <Sparkles size={14} className="mb-0.5 inline text-primary" aria-hidden="true" /> 提交后需管理员审核通过方可公开；
              每天最多创建 3 个话题。
            </div>
            <Button
              type="submit"
              block
              className="rounded-xl"
              disabled={loading || levelBlocked || !isLoggedIn}
              loading={loading}
            >
              {loading ? '提交中' : '提交创建申请'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
