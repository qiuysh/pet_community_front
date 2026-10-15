import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Lock } from 'lucide-react';
import { createTopic } from '../../api/discovery';
import { useUserStore } from '../../stores/userStore';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldLabel, Input, Textarea } from '../../components/ui/input';

/** 创建话题所需最低等级（T5-01 / 总览 §4.3） */
const TOPIC_CREATE_MIN_LEVEL = 5;

export function TopicCreatePage() {
  const navigate = useNavigate();
  const { user, fetchProfile, isLoggedIn } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
    if (!trimmedName) {
      showErrorToast('请填写话题名称');
      return;
    }
    if (trimmedName.length > 50) {
      showErrorToast('话题名称不超过 50 字');
      return;
    }
    if (description.length > 200) {
      showErrorToast('话题描述不超过 200 字');
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
          <Button
            type="button"
            variant="ghost"
            className="p-2 -ml-2 min-w-0 h-auto text-brown"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            <ChevronLeft size={22} />
          </Button>
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
                  继续活跃获取积分即可解锁（详见 <a href="/points" className="text-primary underline">积分等级</a>）。
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="space-y-4 rounded-xl">
            <div>
              <FieldLabel required>话题名称</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="如：橘猫减肥打卡"
                disabled={levelBlocked}
              />
              <p className="mt-1 text-xs text-brown-muted">{name.length}/50</p>
            </div>
            <div>
              <FieldLabel>话题描述</FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={4}
                placeholder="简单介绍话题内容与参与规则"
                disabled={levelBlocked}
              />
              <p className="mt-1 text-xs text-brown-muted">{description.length}/200</p>
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
            >
              {loading ? '提交中...' : '提交创建申请'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
