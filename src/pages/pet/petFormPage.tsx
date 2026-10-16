import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { usePetForm } from '../../hooks/usePetForm';
import { PetTypeOptions, GenderOptions, getPetTypeIcon } from '../../types/pet';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { FieldLabel, Input, Select, Textarea } from '../../components/ui/input';
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
    updateField,
    handleAvatarUpload,
    handleSubmit,
  } = usePetForm();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2 min-w-0 h-auto"
            aria-label="返回"
          >
            <ChevronLeft className="w-5 h-5 text-brown-secondary" />
          </Button>
          <h1 className="text-2xl font-bold text-brown">
            {isEdit ? '编辑宠物档案' : '创建宠物档案'}
          </h1>
        </div>

        <Card className="space-y-6" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center text-brown overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="w-full h-full object-cover" />
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
                        ? 'border-primary bg-primary-soft'
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
              <FieldLabel>宠物名称</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="给你的毛孩子起个名字吧"
                maxLength={20}
              />
            </div>

            <div>
              <FieldLabel>品种</FieldLabel>
              <Select
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
                <FieldLabel>体重 (kg)</FieldLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                checked={formData.isSterilized === 1}
                onChange={(checked) => updateField('isSterilized', checked ? 1 : 0)}
                className="p-3 border border-border-light rounded-md hover:border-primary/30 transition-colors"
              >
                已绝育
              </Checkbox>
              <Checkbox
                checked={formData.isVaccinated === 1}
                onChange={(checked) => updateField('isVaccinated', checked ? 1 : 0)}
                className="p-3 border border-border-light rounded-md hover:border-primary/30 transition-colors"
              >
                已接种疫苗
              </Checkbox>
            </div>

            <div>
              <FieldLabel>性格特点</FieldLabel>
              <Input
                value={formData.personality}
                onChange={(e) => updateField('personality', e.target.value)}
                placeholder="例如：活泼、粘人、贪吃..."
                maxLength={100}
              />
            </div>

            <div>
              <FieldLabel>简介</FieldLabel>
              <Textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                placeholder="介绍一下你的毛孩子吧..."
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
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? '保存中...' : isEdit ? '保存修改' : '创建档案'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
