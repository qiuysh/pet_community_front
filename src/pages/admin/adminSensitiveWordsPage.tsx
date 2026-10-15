import { useState, useEffect } from 'react';
import { Pagination } from '../../components/admin/pagination';
import { AdminInput, AdminLabel } from '../../components/admin/adminField';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { AddSensitiveWordRequest, UpdateSensitiveWordRequest } from '../../types/admin';
import { PawPrint, Search } from 'lucide-react';
import { adminActionClass, adminUi } from '../../styles/adminUi';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

export function AdminSensitiveWordsPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
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
    fetchSensitiveWords(keyword, currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, currentPage]);

  const handleKeywordSearch = () => {
    setKeyword(keywordInput);
    setCurrentPage(1);
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
    setCurrentPage(page);
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
    if (cat.includes('广告')) return 'bg-info/10 text-info';
    return '';
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="敏感词管理"
        description="管理系统的敏感词列表"
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
              ? 'bg-success/10 border border-success/20 text-success'
              : 'bg-error/10 border border-error/20 text-error'
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

      <div className="px-6">
        {loading ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center animate-pulse text-brown-light">
              <PawPrint size={32} aria-hidden="true" />
            </div>
            <p>加载中…</p>
          </AdminTable.Status>
        ) : sensitiveWords.length === 0 ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center text-brown-light">
              <Search size={40} aria-hidden="true" />
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
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* 添加敏感词对话框 */}
      {showAddModal && (
        <div className={adminUi.overlay}>
          <div className={adminUi.modalDialog}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-sm bg-secondary-soft flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brown">添加敏感词</h3>
                  <p className="text-sm text-brown-muted">新增一条敏感词过滤规则</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <AdminLabel required>敏感词</AdminLabel>
                  <AdminInput
                    value={addForm.word}
                    onChange={(e) => setAddForm({ ...addForm, word: e.target.value })}
                    placeholder="请输入敏感词…"
                  />
                </div>
                <div>
                  <AdminLabel>替换为</AdminLabel>
                  <AdminInput
                    value={addForm.replaceWith}
                    onChange={(e) => setAddForm({ ...addForm, replaceWith: e.target.value })}
                    placeholder="替换后的内容（默认*）…"
                  />
                </div>
                <div>
                  <AdminLabel>分类</AdminLabel>
                  <AdminInput
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    placeholder="敏感词分类…"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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
            </div>
          </div>
        </div>
      )}

      {/* 编辑敏感词对话框 */}
      {showEditModal && editingWord && (
        <div className={adminUi.overlay}>
          <div className={adminUi.modalDialog}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-sm bg-secondary-soft flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brown">编辑敏感词</h3>
                  <p className="text-sm text-brown-muted">修改敏感词过滤规则</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <AdminLabel required>敏感词</AdminLabel>
                  <AdminInput
                    value={editForm.word}
                    onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                    placeholder="请输入敏感词…"
                  />
                </div>
                <div>
                  <AdminLabel>替换为</AdminLabel>
                  <AdminInput
                    value={editForm.replaceWith}
                    onChange={(e) => setEditForm({ ...editForm, replaceWith: e.target.value })}
                    placeholder="替换后的内容（默认*）…"
                  />
                </div>
                <div>
                  <AdminLabel>分类</AdminLabel>
                  <AdminInput
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="敏感词分类…"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {confirmDelete !== null && (
        <div className={adminUi.overlay}>
          <div className={adminUi.modalDialog}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brown">确认删除</h3>
                  <p className="text-sm text-brown-muted">此操作无法撤销</p>
                </div>
              </div>
              <p className="text-sm text-brown-secondary mb-6">确定要删除这个敏感词吗？删除后该词将不再被过滤。</p>
              <div className="flex justify-end gap-3">
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
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={isDeleting}
                >
                  {isDeleting ? '删除中…' : '确认删除'}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}