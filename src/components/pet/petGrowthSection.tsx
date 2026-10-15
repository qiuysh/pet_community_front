import { useState } from 'react';
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react';
import type { PetGrowthRecordInfo, PetGrowthRecordCreateRequest } from '../../types/pet';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FilterChip } from '../ui/filterChip';
import { FieldLabel, Input, Textarea } from '../ui/input';
import { Modal } from '../ui/modal';

const RECORD_TYPES = [
  { value: 'weight', label: '体重记录' },
  { value: 'vaccine', label: '疫苗接种' },
  { value: 'deworm', label: '驱虫记录' },
  { value: 'illness', label: '生病记录' },
  { value: 'daily', label: '日常趣事' },
] as const;

interface PetGrowthSectionProps {
  records: PetGrowthRecordInfo[];
  isOwner: boolean;
  saving: boolean;
  onSave: (data: PetGrowthRecordCreateRequest, recordId?: number, onDone?: () => void) => void;
  onDelete: (recordId: number) => void;
}

function toDateInput(value: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function emptyForm(): PetGrowthRecordCreateRequest & { typeKey: string } {
  return {
    typeKey: 'weight',
    title: '体重记录',
    recordDate: new Date().toISOString().slice(0, 10),
    weight: undefined,
    height: undefined,
    content: '',
  };
}

export function PetGrowthSection({
  records,
  isOwner,
  saving,
  onSave,
  onDelete,
}: PetGrowthSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [form, setForm] = useState(emptyForm());
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openCreate = () => {
    setEditingId(undefined);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (record: PetGrowthRecordInfo) => {
    const matched = RECORD_TYPES.find((t) => record.title.startsWith(t.label));
    setEditingId(record.id);
    setForm({
      typeKey: matched?.value ?? 'daily',
      title: record.title,
      recordDate: toDateInput(record.recordDate),
      weight: record.weight || undefined,
      height: record.height || undefined,
      content: record.content || '',
      images: record.images,
    });
    setShowForm(true);
  };

  const handleTypeChange = (typeKey: string) => {
    const found = RECORD_TYPES.find((t) => t.value === typeKey);
    setForm((prev) => ({
      ...prev,
      typeKey,
      title: found?.label ?? prev.title,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (!form.recordDate) return;
    onSave(
      {
        title: form.title.trim(),
        recordDate: form.recordDate,
        weight: form.weight,
        height: form.height,
        content: form.content?.trim() || undefined,
        images: form.images,
      },
      editingId,
      () => {
        setShowForm(false);
        setEditingId(undefined);
        setForm(emptyForm());
      },
    );
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(undefined);
    setForm(emptyForm());
  };

  return (
    <Card className="rounded-xl shadow-sm" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-brown">成长记录</h3>
        {isOwner && (
          <Button type="button" size="sm" onClick={openCreate} className="rounded-lg gap-1.5">
            <Plus size={16} aria-hidden="true" />
            添加记录
          </Button>
        )}
      </div>

      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="border border-border-light rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-medium text-brown">{record.title}</h4>
                  <p className="text-sm text-brown-muted mt-1">
                    {new Date(record.recordDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex gap-3 text-sm text-brown-muted">
                    {record.weight > 0 && <span>体重: {record.weight}kg</span>}
                    {record.height > 0 && <span>身高: {record.height}cm</span>}
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(record)}
                        className="min-w-0 h-auto p-1.5 text-brown-muted hover:text-primary"
                        aria-label="编辑"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmId(record.id)}
                        className="min-w-0 h-auto p-1.5 text-brown-muted hover:text-error"
                        aria-label="删除"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {record.content && (
                <p className="text-sm text-brown-secondary mt-3 whitespace-pre-wrap">{record.content}</p>
              )}
              {record.images && record.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {record.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-3 flex justify-center text-brown-light">
            <TrendingUp size={32} aria-hidden="true" />
          </div>
          <p className="text-brown-muted">暂无成长记录</p>
          {isOwner && (
            <p className="text-sm text-brown-muted mt-2">记录体重、疫苗、驱虫或日常趣事</p>
          )}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingId ? '编辑成长记录' : '添加成长记录'}
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
        footer={
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>
              取消
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={saving || !form.title.trim()}
              onClick={handleSubmit}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel>记录类型</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {RECORD_TYPES.map((t) => (
                <FilterChip
                  key={t.value}
                  active={form.typeKey === t.value}
                  onClick={() => handleTypeChange(t.value)}
                >
                  {t.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>标题</FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              maxLength={100}
            />
          </div>

          <div>
            <FieldLabel>日期</FieldLabel>
            <Input
              type="date"
              value={toDateInput(form.recordDate)}
              onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>体重 (kg)</FieldLabel>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.weight ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    weight: e.target.value === '' ? undefined : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>身高 (cm)</FieldLabel>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.height ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    height: e.target.value === '' ? undefined : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div>
            <FieldLabel>备注</FieldLabel>
            <Textarea
              value={form.content ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={3}
              placeholder="症状、疫苗名称、下次提醒等"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title="删除记录"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>
              取消
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (confirmId !== null) {
                  onDelete(confirmId);
                  setConfirmId(null);
                }
              }}
            >
              删除
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brown-muted">确定删除这条成长记录吗？</p>
      </Modal>
    </Card>
  );
}
