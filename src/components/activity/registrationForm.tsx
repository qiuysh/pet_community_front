import { useState } from 'react';
import { useToast } from '../toast';
import { createRegistration } from '../../api/activity';
import { ActivityInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel, Input, Textarea } from '../ui/input';

interface RegistrationFormProps {
  activity: ActivityInfo;
  onSuccess?: () => void;
}

export const RegistrationForm = ({ activity, onSuccess }: RegistrationFormProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning('请填写姓名');
      return;
    }
    if (!phone.trim()) {
      toast.warning('请填写手机号');
      return;
    }

    run(
      () =>
        createRegistration({
          activityId: activity.id,
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim() || undefined,
        }),
      () => {
        toast.success('报名成功');
        setName('');
        setPhone('');
        setMessage('');
        onSuccess?.();
      },
      (err) => toast.error((err as Error).message || '报名失败'),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel required>姓名</FieldLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入真实姓名"
          maxLength={50}
        />
      </div>

      <div>
        <FieldLabel required>手机号</FieldLabel>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="请输入手机号"
          maxLength={20}
        />
      </div>

      <div>
        <FieldLabel>留言（可选）</FieldLabel>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="可补充报名说明…"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{message.length}/200</div>
      </div>

      <Button type="submit" block loading={loading} disabled={loading}>
        {loading ? '提交中...' : '提交报名'}
      </Button>
    </form>
  );
};
