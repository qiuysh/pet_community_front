import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2 } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { getDraftList, deleteDraft } from '../../api/post';
import { useAsyncEffect } from '../../hooks/useAsync';
import { DraftInfo } from '../../types/post';
import { formatRelativeTime } from '../../utils/format';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ui/confirmDialog';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';

function draftPreview(content: string): string {
  const text = content.replace(/\s+/g, ' ').trim();
  if (!text) return '（无文字内容）';
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export function DraftListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { loading, data, setData } = useAsyncEffect(
    () => getDraftList(page, pageSize),
    [page],
    { onError: () => showErrorToast('获取草稿失败') },
  );

  const drafts: DraftInfo[] = data?.list ?? [];
  const total = data?.total ?? 0;

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteDraft(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              list: prev.list.filter((d) => d.id !== id),
              total: Math.max(0, prev.total - 1),
            }
          : prev,
      );
      showSuccessToast('草稿已删除');
      setDeleteTarget(null);
    } catch {
      showErrorToast('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-shell min-h-screen bg-cream pb-10">
      <PageHeader
        title="草稿箱"
        fallbackTo="/posts/create"
        right={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary-text"
            onClick={() => navigate('/posts/create')}
          >
            写动态
          </Button>
        }
      />

      <div className="space-y-3 px-4 py-4">
        {loading && drafts.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="md">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-24" />
              </Card>
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <EmptyState
            title="暂无草稿"
            description="写到一半也能存下来，灵感不会跑丢"
          />
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} padding="md" className="flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <p className="page-section-title text-brown line-clamp-2">
                  {draftPreview(draft.content || '')}
                </p>
                <p className="text-xs text-brown-muted mt-2">
                  更新于 {formatRelativeTime(draft.updatedAt || draft.createdAt)}
                </p>
              </div>
              <div className="flex flex-row gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-lg text-primary-text"
                  aria-label="继续编辑"
                  onClick={() => navigate(`/posts/drafts/${draft.id}`)}
                >
                  <FileEdit
                    size={ICON_SIZE.action}
                    strokeWidth={iconStroke(ICON_SIZE.action)}
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-lg text-error-text"
                  aria-label="删除草稿"
                  onClick={() => setDeleteTarget(draft.id)}
                >
                  <Trash2
                    size={ICON_SIZE.action}
                    strokeWidth={iconStroke(ICON_SIZE.action)}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </Card>
          ))
        )}

        {total > page * pageSize && (
          <div className="text-center pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
              加载更多
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除草稿？"
        description="删除后草稿内容将永久丢失，无法恢复。"
        confirmText="删除"
        loading={deleting}
        onConfirm={() => deleteTarget !== null && handleDelete(deleteTarget)}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
