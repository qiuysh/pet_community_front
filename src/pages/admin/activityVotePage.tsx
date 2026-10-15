import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../../components/toast';
import { useAsyncEffect, useAsync } from '../../hooks/useAsync';
import { getAwardPage, batchSetAward, publishAwards } from '../../api/activity';
import { AwardRequest } from '../../types/activity';
import { AwardSetting } from '../../components/activity/AwardSetting';
import { AwardResultDisplay } from '../../components/activity/AwardResultDisplay';
import { AdminInput, AdminSelect } from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip } from '../../components/admin/adminChip';
import { adminUi } from '../../styles/adminUi';

export const ActivityVotePage = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { loading, data: awardData, refetch } = useAsyncEffect(
    () => getAwardPage(parseInt(id!)),
    [id],
    { onError: (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载评选数据失败') },
  );
  const { loading: publishing, run: runPublish } = useAsync();
  const [selectedAward, setSelectedAward] = useState<'first' | 'second' | 'third'>('first');
  const [sortOrder, setSortOrder] = useState<'votes' | 'time'>('votes');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleBatchAward = async (awards: AwardRequest[]) => {
    try {
      await batchSetAward({ awards });
      toast.success('获奖设置成功');
      refetch();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || '获奖设置失败');
    }
  };

  const handlePublishAwards = () => {
    if (!awardData || awardData.awardedCount === 0) {
      toast.warning('请先设置获奖作品');
      return;
    }

    if (!window.confirm('确定要发布评选结果吗？发布后将通知所有获奖用户。')) {
      return;
    }

    runPublish(
      () => publishAwards(parseInt(id!)),
      (result) => {
        if (result.success) {
          toast.success(result.message);
          refetch();
        } else {
          toast.warning(result.message);
        }
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '发布结果失败'),
    );
  };

  const filteredSubmissions =
    awardData?.submissions
      .filter((submission) => {
        if (searchKeyword) {
          return (
            submission.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            submission.userNickname.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'votes') {
          return b.votesCount - a.votesCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }) || [];

  if (loading) {
    return <div className="p-6 text-center">加载中…</div>;
  }

  if (!awardData) {
    return <div className="p-6 text-center text-error">评选数据加载失败</div>;
  }

  const awardTone = (level?: string) => {
    if (level === 'first') return 'danger' as const;
    if (level === 'second') return 'warning' as const;
    return 'neutral' as const;
  };

  const awardLabel = (level?: string) => {
    if (level === 'first') return '一等奖';
    if (level === 'second') return '二等奖';
    return '三等奖';
  };

  return (
    <div className="bg-white rounded-md shadow-card animate-fadeIn p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={adminUi.pageTitle}>活动评选</h1>
          <p className="text-sm text-brown-muted mt-1">{awardData.activity.title}</p>
        </div>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={handlePublishAwards}
          disabled={publishing || awardData.awardedCount === 0}
          loading={publishing}
          className="!bg-success hover:!bg-success/90 focus:!ring-success/20"
        >
          {publishing ? '发布中…' : '发布评选结果'}
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md border border-border-light p-4">
            <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-brown">作品列表</h2>
              <div className="flex gap-3">
                <AdminInput
                  type="text"
                  aria-label="搜索作品或用户"
                  placeholder="搜索作品或用户…"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-48"
                />
                <AdminSelect
                  aria-label="排序方式"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'votes' | 'time')}
                  className="w-auto min-w-[8.5rem]"
                >
                  <option value="votes">按票数排序</option>
                  <option value="time">按时间排序</option>
                </AdminSelect>
              </div>
            </div>

            <div className="space-y-4">
              {filteredSubmissions.map((submission, index) => (
                <div
                  key={submission.id}
                  className="flex items-center gap-4 p-3 border border-border-light rounded-sm hover:bg-soft"
                >
                  <div className="flex-shrink-0 w-8 text-center font-semibold text-brown-secondary tabular-nums">
                    {sortOrder === 'votes' ? index + 1 : ''}
                  </div>
                  {submission.images && submission.images.length > 0 && (
                    <img
                      src={submission.images[0]}
                      alt={submission.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-sm"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown truncate">{submission.title}</p>
                    <p className="text-sm text-brown-muted mt-1">作者: {submission.userNickname}</p>
                    <p className="text-xs text-brown-muted mt-1">{submission.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-brown-secondary tabular-nums">
                      {submission.votesCount} 票
                    </span>
                    {submission.isAwarded && (
                      <AdminChip tone={awardTone(submission.awardLevel)}>
                        {awardLabel(submission.awardLevel)}
                      </AdminChip>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-brown-muted">
              共 {filteredSubmissions.length} 个作品，已设置获奖 {awardData.awardedCount} 个
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AwardSetting
            submissions={filteredSubmissions}
            selectedAward={selectedAward}
            onAwardChange={setSelectedAward}
            onSubmit={handleBatchAward}
          />

          <AwardResultDisplay
            firstPrize={awardData.firstPrize}
            secondPrizes={awardData.secondPrizes}
            thirdPrizes={awardData.thirdPrizes}
          />
        </div>
      </div>
    </div>
  );
};
