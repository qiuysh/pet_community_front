import { useAdoptCreate, isPlaceholderPhoto } from '../../hooks/useAdoptCreate';
import { PetType, PetGender } from '../../types/adopt';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldLabel, Input, Select, Textarea } from '../../components/ui/input';

export const AdoptCreatePage = () => {
  const {
    loading,
    uploading,
    formData,
    setFormData,
    handleSubmit,
    handlePhotoUpload,
  } = useAdoptCreate();

  return (
    <div className="bg-cream min-h-screen pb-6">
      <div className="sticky top-[var(--user-header-offset,56px)] bg-white z-10 shadow-card">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brown">发布领养</h1>
          <Button size="sm" disabled={loading} onClick={handleSubmit}>
            {loading ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card>
          <h2 className="text-base font-medium text-brown mb-4">基本信息</h2>
          <div className="space-y-3">
            <div>
              <FieldLabel required>宠物名称</FieldLabel>
              <Input
                value={formData.petName}
                onChange={(e) => setFormData((prev) => ({ ...prev, petName: e.target.value }))}
                placeholder="请填写宠物名称"
              />
            </div>

            <div>
              <FieldLabel required>宠物类型</FieldLabel>
              <Select
                value={formData.petType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, petType: e.target.value as PetType }))
                }
              >
                <option value={PetType.CAT}>猫咪</option>
                <option value={PetType.DOG}>狗狗</option>
                <option value={PetType.BIRD}>鸟类</option>
                <option value={PetType.FISH}>鱼类</option>
                <option value={PetType.OTHER}>其他</option>
              </Select>
            </div>

            <div>
              <FieldLabel>年龄</FieldLabel>
              <Input
                value={formData.petAge}
                onChange={(e) => setFormData((prev) => ({ ...prev, petAge: e.target.value }))}
                placeholder="例如：2岁"
              />
            </div>

            <div>
              <FieldLabel>性别</FieldLabel>
              <Select
                value={formData.petGender}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    petGender: parseInt(e.target.value) as PetGender,
                  }))
                }
              >
                <option value={PetGender.UNKNOWN}>未知</option>
                <option value={PetGender.MALE}>公</option>
                <option value={PetGender.FEMALE}>母</option>
              </Select>
            </div>

            <div>
              <FieldLabel>健康状况</FieldLabel>
              <Input
                value={formData.healthStatus}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, healthStatus: e.target.value }))
                }
                placeholder="例如：已绝育、疫苗齐全"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-medium text-brown mb-4">宠物照片 *</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-sm bg-muted text-brown-secondary cursor-pointer hover:bg-border-light"
            >
              选择照片
            </label>
            <span className="text-xs text-brown-muted">最多9张</span>
          </div>
          {formData.photos.length > 0 && (
            <div className="mt-3 text-sm text-brown-muted">
              已选择 {formData.photos.length} 张照片{uploading ? '（上传中...）' : ''}
            </div>
          )}
          {formData.photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {formData.photos.map((photo, idx) => {
                const pending = isPlaceholderPhoto(photo);
                return (
                  <div
                    key={`${photo}-${idx}`}
                    className="relative aspect-square rounded-md overflow-hidden border border-border-light"
                  >
                    {pending ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-brown-muted text-xs animate-pulse">
                        上传中
                      </div>
                    ) : (
                      <img
                        src={photo}
                        alt={`photo-${idx}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="absolute top-1 right-1 min-w-9 min-h-9 w-9 h-9 p-0 rounded-full text-sm bg-black/60 hover:bg-black/80 border-0"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== idx),
                        }));
                      }}
                      aria-label="删除此照片"
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-medium text-brown mb-4">详细介绍</h2>
          <div className="space-y-3">
            <div>
              <FieldLabel required>宠物介绍</FieldLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                placeholder="请详细描述宠物的情况、性格特点等"
              />
            </div>
            <div>
              <FieldLabel>领养条件</FieldLabel>
              <Textarea
                value={formData.adoptConditions}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, adoptConditions: e.target.value }))
                }
                rows={3}
                placeholder="例如：有稳定住所、定期回访等"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-medium text-brown mb-4">联系方式</h2>
          <div className="space-y-3">
            <div>
              <FieldLabel required>所在地区</FieldLabel>
              <Input
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="例如：北京市朝阳区"
              />
            </div>
            <div>
              <FieldLabel required>联系电话</FieldLabel>
              <Input
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="请填写联系电话"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
