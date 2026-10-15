import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { createLostPet } from '../../api/pet';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldLabel, Input, Select, Textarea } from '../../components/ui/input';

export function LostPetCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState(1);
  const [description, setDescription] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostTime, setLostTime] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !description.trim() || !lostLocation.trim() || !lostTime || !contact.trim()) {
      showErrorToast('请填写必填项');
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
          <h1 className="text-lg font-semibold text-brown">发布寻宠</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-4">
        <Card className="space-y-4 rounded-xl">
          <div>
            <FieldLabel required>宠物名称</FieldLabel>
            <Input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div>
            <FieldLabel required>宠物类型</FieldLabel>
            <Select
              value={petType}
              onChange={(e) => setPetType(Number(e.target.value))}
            >
              <option value={1}>猫</option>
              <option value={2}>狗</option>
              <option value={3}>其他</option>
            </Select>
          </div>
          <div>
            <FieldLabel required>走失地点</FieldLabel>
            <Input
              value={lostLocation}
              onChange={(e) => setLostLocation(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>走失时间</FieldLabel>
            <Input
              type="datetime-local"
              value={lostTime}
              onChange={(e) => setLostTime(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>联系方式</FieldLabel>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>详细描述</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={5}
            />
          </div>
          <Button type="submit" block disabled={loading} className="rounded-xl">
            {loading ? '提交中...' : '发布启事'}
          </Button>
        </Card>
      </form>
    </div>
  );
}
