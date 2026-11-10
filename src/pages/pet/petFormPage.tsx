import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePetForm } from '../../hooks/usePetForm';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { PetTypeOptions, GenderOptions, getPetTypeIcon } from '../../types/pet';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldError, FieldLabel, Input, Select, Textarea } from '../../components/ui/input';
import { Radio, RadioGroup } from '../../components/ui/radio';

export function PetFormPage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const {
    isEdit,
    loading,
    uploadingAvatar,
    breeds,
    formData,
    errors,
    updateField,
    handleAvatarUpload,
    handleSubmit,
  } = usePetForm();

  const isDirty =
    formData.name.trim().length > 0 ||
    (formData.bio ?? '').trim().length > 0 ||
    (formData.personality ?? '').trim().length > 0 ||
    (formData.avatar ?? '').trim().length > 0;
  const unsavedDialog = useUnsavedChanges(isDirty && !loading, {
    message: '宠物档案尚未保存，离开后填写的内容将丢失。',
  });

  return (
    <div className="min-h-screen bg-cream">
      <div className="page-shell px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <h1 className="text-lg font-semibold text-brown">
            {isEdit ? '编辑宠物档案' : '创建宠物档案'}
          </h1>
        </div>

        <Card className="space-y-6" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center text-brown overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="w-full h-full object-cover" decoding="async" />
                ) : (
                  (() => {
                    const PetIcon = getPetTypeIcon(formData.petType);
                    return <PetIcon size={32} aria-hidden="true" />;
                  })()
                )}
              </div>
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(e) => {
                    void handleAvatarUpload(e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {uploadingAvatar ? '上传中…' : '上传头像'}
                </Button>
                <p className="text-xs text-brown-muted mt-2">支持 JPG、PNG、WebP 格式，小于 2MB</p>
              </div>
            </div>

            <div>
              <FieldLabel>宠物类型</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {PetTypeOptions.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant="ghost"
                    onClick={() => updateField('petType', type.value)}
                    className={`flex flex-col items-center gap-1 p-3 h-auto min-h-0 rounded-md border-2 transition-colors ${
                      formData.petType === type.value
                        ? 'border-primary-text bg-primary-soft'
                        : 'border-border-light hover:border-border'
                    }`}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <span className="text-xs text-brown-secondary">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="pet-name" required>宠物名称</FieldLabel>
              <Input
                id="pet-name"
                name="name"
                autoComplete="off"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="给你的毛孩子起个名字吧…"
                maxLength={20}
                invalid={!!errors.name}
                aria-describedby={errors.name ? 'pet-name-error' : undefined}
              />
              <FieldError id="pet-name-error">{errors.name}</FieldError>
            </div>

            <div>
              <FieldLabel htmlFor="pet-breed">品种</FieldLabel>
              <Select
                id="pet-breed"
                name="breedId"
                value={formData.breedId || ''}
                onChange={(e) => {
                  const breedId = parseInt(e.target.value) || 0;
                  const breed = breeds.find((b) => b.id === breedId);
                  updateField('breedId', breedId);
                  updateField('breedName', breed?.name || '');
                }}
              >
                <option value="">请选择品种</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>性别</FieldLabel>
                <RadioGroup
                  name="gender"
                  aria-label="宠物性别"
                  className="flex gap-3"
                  value={String(formData.gender)}
                  onChange={(v) => updateField('gender', Number(v))}
                >
                  {GenderOptions.map((option) => (
                    <Radio key={option.value} value={String(option.value)} variant="button">
                      {option.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <FieldLabel htmlFor="pet-weight">体重 (kg)</FieldLabel>
                <Input
                  id="pet-weight"
                  name="weight"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="200"
                  value={formData.weight || ''}
                  onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  invalid={!!errors.weight}
                  aria-describedby={errors.weight ? 'pet-weight-error' : undefined}
                />
                <FieldError id="pet-weight-error">{errors.weight}</FieldError>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                checked={formData.isSterilized === 1}
                onChange={(checked) => updateField('isSterilized', checked ? 1 : 0)}
                className="p-3 border border-border-light rounded-md hover:border-primary-text/30 transition-colors"
              >
                已绝育
              </Checkbox>
              <Checkbox
                checked={formData.isVaccinated === 1}
                onChange={(checked) => updateField('isVaccinated', checked ? 1 : 0)}
                className="p-3 border border-border-light rounded-md hover:border-primary-text/30 transition-colors"
              >
                已接种疫苗
              </Checkbox>
            </div>

            <div>
              <FieldLabel htmlFor="pet-personality">性格特点</FieldLabel>
              <Input
                id="pet-personality"
                name="personality"
                autoComplete="off"
                value={formData.personality}
                onChange={(e) => updateField('personality', e.target.value)}
                placeholder="例如：活泼、粘人、贪吃…"
                maxLength={100}
              />
            </div>

            <div>
              <FieldLabel htmlFor="pet-bio">简介</FieldLabel>
              <Textarea
                id="pet-bio"
                name="bio"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                placeholder="介绍一下你的毛孩子吧…"
                maxLength={500}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/pets')}
              >
                取消
              </Button>
              <Button type="submit" className="flex-1" disabled={loading} loading={loading}>
                {loading ? '保存中' : isEdit ? '保存修改' : '创建档案'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {unsavedDialog}
    </div>
  );
}
