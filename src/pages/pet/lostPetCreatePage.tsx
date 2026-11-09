import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ICON_SIZE } from '../../styles/iconSize';
import { createLostPet, uploadLostPetPhoto } from '../../api/pet';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { DateTimePicker } from '../../components/ui/dateTimePicker';
import { FieldError, FieldLabel, Input, Select, Textarea } from '../../components/ui/input';

const MAX_IMAGES = 9;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const isPlaceholder = (url: string) =>
  url.startsWith('placeholder-') || url.startsWith('blob:') || url.startsWith('file:');

export function LostPetCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState(1);
  const [description, setDescription] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostTime, setLostTime] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const isDirty =
    petName.trim().length > 0 ||
    description.trim().length > 0 ||
    lostLocation.trim().length > 0 ||
    contact.trim().length > 0 ||
    images.length > 0;
  const unsavedDialog = useUnsavedChanges(isDirty && !loading, {
    message: '寻宠启事尚未发布，离开后填写的内容将丢失。',
  });
  const { errors, showErrors, clearError, formRef } = useFormErrors([
    'petName',
    'lostLocation',
    'lostTime',
    'contact',
    'description',
  ] as const);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) {
      showErrorToast(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    const accepted = Array.from(files).slice(0, slots);
    const valid: File[] = [];
    for (const f of accepted) {
      if (f.size > MAX_IMAGE_BYTES) {
        showErrorToast(`${f.name} 超过 5MB，已跳过`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;

    const timeMs = Date.now();
    const placeholders = valid.map((_, i) => `placeholder-${timeMs}-${i}`);
    setImages((prev) => [...prev, ...placeholders]);
    setUploading(true);
    try {
      for (let i = 0; i < valid.length; i++) {
        const placeholder = placeholders[i];
        try {
          const res = await uploadLostPetPhoto(valid[i]);
          setImages((prev) => prev.map((u) => (u === placeholder ? res.url : u)));
        } catch (err) {
          showErrorToast(`${valid[i].name} 上传失败：${(err as Error).message || '请重试'}`);
          setImages((prev) => prev.filter((u) => u !== placeholder));
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors<'petName' | 'lostLocation' | 'lostTime' | 'contact' | 'description'> = {};
    if (!petName.trim()) {
      next.petName = '请填写宠物名称';
    }
    if (!lostLocation.trim()) {
      next.lostLocation = '请填写走失地点';
    }
    if (!lostTime) {
      next.lostTime = '请选择走失时间';
    }
    if (!contact.trim()) {
      next.contact = '请填写联系方式';
    }
    if (!description.trim()) {
      next.description = '请填写详细描述';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }
    if (uploading) {
      showErrorToast('图片正在上传中，请稍候');
      return;
    }
    const pending = images.filter(isPlaceholder);
    if (pending.length > 0) {
      showErrorToast('仍有图片未完成上传');
      return;
    }
    setLoading(true);
    try {
      const created = await createLostPet({
        petName: petName.trim(),
        petType,
        description: description.trim(),
        lostLocation: lostLocation.trim(),
        lostTime,
        contact: contact.trim(),
        images: images.length > 0 ? images : undefined,
      });
      showSuccessToast('发布成功');
      navigate(`/lost-pets/${created.id}`);
    } catch (err) {
      showErrorToast((err as Error).message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white border-b border-border-light">
        <div className="page-shell py-3 flex items-center gap-2">
          <BackButton className="-ml-2" />
          <h1 className="text-lg font-semibold text-brown">发布寻宠</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} ref={formRef} className="page-shell py-4" noValidate>
        <Card className="space-y-4 rounded-xl">
          <div>
            <FieldLabel htmlFor="lost-pet-name" required>宠物名称</FieldLabel>
            <Input
              id="lost-pet-name"
              name="petName"
              autoComplete="off"
              value={petName}
              onChange={(e) => {
                setPetName(e.target.value);
                clearError('petName');
              }}
              maxLength={50}
              placeholder="请输入宠物名称…"
              invalid={!!errors.petName}
              aria-describedby={errors.petName ? 'lost-pet-name-error' : undefined}
            />
            <FieldError id="lost-pet-name-error">{errors.petName}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="lost-pet-type" required>宠物类型</FieldLabel>
            <Select
              id="lost-pet-type"
              name="petType"
              value={petType}
              onChange={(e) => setPetType(Number(e.target.value))}
            >
              <option value={1}>猫</option>
              <option value={2}>狗</option>
              <option value={3}>其他</option>
            </Select>
          </div>
          <div>
            <FieldLabel>宠物照片</FieldLabel>
            <div className="flex items-center gap-2 mt-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="sr-only"
                onChange={(e) => {
                  void handlePhotoUpload(e.target.files);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || images.length >= MAX_IMAGES}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? '上传中…' : '选择照片'}
              </Button>
              <span className="text-xs text-brown-muted">最多 {MAX_IMAGES} 张，单张 ≤5MB</span>
            </div>
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((photo, idx) => {
                  const pending = isPlaceholder(photo);
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
                        <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      )}
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="absolute top-1 right-1 min-w-8 min-h-8 w-8 h-8 p-0 rounded-full bg-black/60 hover:bg-black/80 border-0"
                        aria-label="删除图片"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <X size={ICON_SIZE.inline} aria-hidden="true" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="lost-location" required>走失地点</FieldLabel>
            <Input
              id="lost-location"
              name="lostLocation"
              autoComplete="off"
              value={lostLocation}
              onChange={(e) => {
                setLostLocation(e.target.value);
                clearError('lostLocation');
              }}
              placeholder="如：朝阳区望京公园附近…"
              invalid={!!errors.lostLocation}
              aria-describedby={errors.lostLocation ? 'lost-location-error' : undefined}
            />
            <FieldError id="lost-location-error">{errors.lostLocation}</FieldError>
          </div>
          <div>
            <FieldLabel required>走失时间</FieldLabel>
            <DateTimePicker
              aria-label="走失时间"
              value={lostTime}
              onChange={(value) => {
                setLostTime(value);
                clearError('lostTime');
              }}
              granularity="minute"
            />
            <FieldError>{errors.lostTime}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="lost-contact" required>联系方式</FieldLabel>
            <Input
              id="lost-contact"
              name="contact"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                clearError('contact');
              }}
              placeholder="手机号或微信号…"
              invalid={!!errors.contact}
              aria-describedby={errors.contact ? 'lost-contact-error' : undefined}
            />
            <FieldError id="lost-contact-error">{errors.contact}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="lost-description" required>详细描述</FieldLabel>
            <Textarea
              id="lost-description"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError('description');
              }}
              maxLength={500}
              rows={5}
              placeholder="描述宠物的外貌特征、走失经过等…"
              invalid={!!errors.description}
              aria-describedby={errors.description ? 'lost-description-error' : undefined}
            />
            <FieldError id="lost-description-error">{errors.description}</FieldError>
          </div>
          <Button type="submit" block disabled={loading || uploading} loading={loading} className="rounded-xl">
            {loading ? '提交中…' : '发布启事'}
          </Button>
        </Card>
      </form>

      {unsavedDialog}
    </div>
  );
}
