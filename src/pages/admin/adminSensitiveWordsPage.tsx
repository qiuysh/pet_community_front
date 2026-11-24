import { useState, useEffect } from 'react';
import { Pagination } from '../../components/admin/pagination';
import { AdminInput, AdminLabel } from '../../components/admin/adminField';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { useSyncedSearchParams } from '../../hooks/useSyncedSearchParams';
import { AddSensitiveWordRequest, UpdateSensitiveWordRequest } from '../../types/admin';
import { AlertTriangle, Pencil, Plus, Search } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { adminActionClass, adminUi } from '../../styles/adminUi';
import { Modal } from '../../components/ui';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable, AdminTableSkeleton } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

const SENSITIVE_QUERY = {
  page: { kind: 'number', default: 1 },
  keyword: { kind: 'string', default: '' },
} as const;

const PAGE_SIZE = 20;

export function AdminSensitiveWordsPage() {
  const [query, setQuery] = useSyncedSearchParams(SENSITIVE_QUERY, { resetPageOn: ['keyword'] });
  const keyword = query.keyword;
  const currentPage = query.page;
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState<{ id: number; word: string; replaceWith: string; category: string } | null>(null);
  const [addForm, setAddForm] = useState<AddSensitiveWordRequest>({
    word: '',
    replaceWith: '',
    category: '',
  });
  const [editForm, setEditForm] = useState<UpdateSensitiveWordRequest>({
    word: '',
    replaceWith: '',
    category: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    sensitiveWords,
    totalWords,
    loading,
    error,
    fetchSensitiveWords,
    handleAddSensitiveWord,
    handleUpdateSensitiveWord,
    handleDeleteSensitiveWord,
    setError,
  } = useAdminSettings();

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  useEffect(() => {
    fetchSensitiveWords(keyword, currentPage, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, currentPage]);

  const handleKeywordSearch = () => {
    setQuery({ keyword: keywordInput.trim(), page: 1 });
  };

  const handleAdd = async () => {
    if (!addForm.word.trim()) {
      setError('请输入敏感词');
      return;
    }
    const success = await handleAddSensitiveWord(addForm);
    if (success) {
      setShowAddModal(false);
      setAddForm({ word: '', replaceWith: '', category: '' });
      setError('敏感词添加成功');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = async () => {
    if (!editingWord || !editForm.word.trim()) {
      setError('请输入敏感词');
      return;
    }
    const success = await handleUpdateSensitiveWord(editingWord.id, editForm);
    if (success) {
      setShowEditModal(false);
      setEditingWord(null);
      setEditForm({ word: '', replaceWith: '', category: '' });
      setError('敏感词更新成功');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    const success = await handleDeleteSensitiveWord(id);
    setIsDeleting(false);
    if (success) {
      setConfirmDelete(null);
      setError('敏感词删除成功');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openEditModal = (word: { id: number; word: string; replaceWith: string; category: string }) => {
    setEditingWord(word);
    setEditForm({
      word: word.word,
      replaceWith: word.replaceWith,
      category: word.category,
    });
    setShowEditModal(true);
  };

  const handlePageChange = (page: number) => {
    setQuery({ page });
  };

  const getCategoryTone = (category: string): AdminChipTone => {
    if (!category) return 'neutral';
    const cat = category.toLowerCase();
    if (cat.includes('政治') || cat.includes('暴力')) return 'danger';
    if (cat.includes('色情')) return 'warning';
    if (cat.includes('广告')) return 'neutral';
    return 'secondary';
  };

  const getCategoryChipClass = (category: string) => {
    if (!category) return 'bg-muted text-brown-secondary';
    const cat = category.toLowerCase();
    if (cat.includes('广告')) return 'bg-info/10 text-info-text';
    return '';
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="敏感词库"
        description="维护内容过滤词表，支持启用与停用"
        actions={
          <AdminButton type="button" variant="secondary" onClick={() => setShowAddModal(true)}>
            添加敏感词
          </AdminButton>
        }
      />

      {error && (
        <div
          className={`mx-6 mt-4 px-4 py-3 rounded-md text-sm ${
            error.includes('成功')
              ? 'bg-success/10 border border-success/20 text-success-text'
              : 'bg-error/10 border border-error/20 text-error-text'
          }`}
          role="status"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="关键词" htmlFor="sensitive-word-keyword">
            <AdminInput
              id="sensitive-word-keyword"
              name="keyword"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              placeholder="搜索敏感词…"
              autoComplete="off"
              spellCheck={false}
            />
          </AdminFilterField>
        </AdminFilterBar>
      </div>

      <div>
        {loading ? (
          <AdminTableSkeleton columns={4} />
        ) : sensitiveWords.length === 0 ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center text-brown-light">
              <Search size={ICON_SIZE.empty} aria-hidden="true" />
            </div>
            <p>暂无数据</p>
          </AdminTable.Status>
        ) : (
          <AdminTable aria-label="敏感词列表">
            <AdminTable.Header>
              <AdminTable.Column isRowHeader>敏感词</AdminTable.Column>
              <AdminTable.Column>替换为</AdminTable.Column>
              <AdminTable.Column>分类</AdminTable.Column>
              <AdminTable.Column>创建时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {sensitiveWords.map((word) => (
                <AdminTable.Row key={word.id} id={String(word.id)}>
                  <AdminTable.Cell className="whitespace-nowrap font-medium">{word.word}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">
                    {word.replaceWith || '-'}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getCategoryTone(word.category)} className={getCategoryChipClass(word.category)}>
                      {word.category || '默认'}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-muted">{word.createdAt}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className={adminUi.actions}>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          openEditModal({
                            id: word.id,
                            word: word.word,
                            replaceWith: word.replaceWith,
                            category: word.category,
                          })
                        }
                        className={adminActionClass('primary')}
                      >
                        编辑
                      </AdminButton>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmDelete(word.id)}
                        className={adminActionClass('danger')}
                      >
                        删除
                      </AdminButton>
                    </div>
                  </AdminTable.Cell>
                </AdminTable.Row>
              ))}
            </AdminTable.Body>
          </AdminTable>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        total={totalWords}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddForm({ word: '', replaceWith: '', category: '' });
        }}
        title="添加敏感词"
        tone="secondary"
        footer={
          <div className="flex w-full justify-end gap-3">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setAddForm({ word: '', replaceWith: '', category: '' });
              }}
            >
              取消
            </AdminButton>
            <AdminButton type="button" variant="secondary" onClick={handleAdd} disabled={loading}>
              添加
            </AdminButton>
          </div>
        }
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-sm bg-secondary-soft flex items-center justify-center">
            <Plus
              size={ICON_SIZE.nav}
              strokeWidth={iconStroke(ICON_SIZE.nav)}
              className="text-secondary-dark"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-brown-muted">新增一条敏感词过滤规则</p>
        </div>
        <div className="space-y-4">
          <div>
            <AdminLabel htmlFor="add-sensitive-word" required>
              敏感词
            </AdminLabel>
            <AdminInput
              id="add-sensitive-word"
              name="word"
              value={addForm.word}
              onChange={(e) => setAddForm({ ...addForm, word: e.target.value })}
              placeholder="请输入敏感词…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <AdminLabel htmlFor="add-sensitive-replace">替换为</AdminLabel>
            <AdminInput
              id="add-sensitive-replace"
              name="replaceWith"
              value={addForm.replaceWith}
              onChange={(e) => setAddForm({ ...addForm, replaceWith: e.target.value })}
              placeholder="替换后的内容（默认*）…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <AdminLabel htmlFor="add-sensitive-category">分类</AdminLabel>
            <AdminInput
              id="add-sensitive-category"
              name="category"
              value={addForm.category}
              onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              placeholder="敏感词分类…"
              autoComplete="off"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showEditModal && Boolean(editingWord)}
        onClose={() => {
          setShowEditModal(false);
          setEditingWord(null);
          setEditForm({ word: '', replaceWith: '', category: '' });
        }}
        title="编辑敏感词"
        tone="secondary"
        footer={
          <div className="flex w-full justify-end gap-3">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingWord(null);
                setEditForm({ word: '', replaceWith: '', category: '' });
              }}
            >
              取消
            </AdminButton>
            <AdminButton type="button" variant="secondary" onClick={handleEdit} disabled={loading}>
              保存
            </AdminButton>
          </div>
        }
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-sm bg-secondary-soft flex items-center justify-center">
            <Pencil
              size={ICON_SIZE.nav}
              strokeWidth={iconStroke(ICON_SIZE.nav)}
              className="text-secondary-dark"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-brown-muted">修改敏感词过滤规则</p>
        </div>
        <div className="space-y-4">
          <div>
            <AdminLabel htmlFor="edit-sensitive-word" required>
              敏感词
            </AdminLabel>
            <AdminInput
              id="edit-sensitive-word"
              name="word"
              value={editForm.word}
              onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
              placeholder="请输入敏感词…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <AdminLabel htmlFor="edit-sensitive-replace">替换为</AdminLabel>
            <AdminInput
              id="edit-sensitive-replace"
              name="replaceWith"
              value={editForm.replaceWith}
              onChange={(e) => setEditForm({ ...editForm, replaceWith: e.target.value })}
              placeholder="替换后的内容（默认*）…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <AdminLabel htmlFor="edit-sensitive-category">分类</AdminLabel>
            <AdminInput
              id="edit-sensitive-category"
              name="category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              placeholder="敏感词分类…"
              autoComplete="off"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="确认删除"
        tone="secondary"
        footer={
          <div className="flex w-full justify-end gap-3">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={isDeleting}
            >
              取消
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {isDeleting ? '删除中…' : '确认删除'}
            </AdminButton>
          </div>
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle
              size={ICON_SIZE.nav}
              strokeWidth={iconStroke(ICON_SIZE.nav)}
              className="text-error-text"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-brown-muted">此操作无法撤销</p>
        </div>
        <p className="text-sm text-brown-secondary">确定要删除这个敏感词吗？删除后该词将不再被过滤。</p>
      </Modal>
    </div>
  );
}