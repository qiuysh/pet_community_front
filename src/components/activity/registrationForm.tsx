import { useState } from 'react';
import { useToast } from '../toast';
import { createRegistration } from '../../api/activity';
import { ActivityInfo } from '../../types/activity';
import { useAsync } from '../../hooks/useAsync';
import { useFormErrors, type FormErrors } from '../../hooks/useFormErrors';
import { Button } from '../ui/button';
import { FieldError, FieldLabel, Input, Textarea } from '../ui/input';

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
  const { errors, showErrors, clearError, formRef } = useFormErrors(['name', 'phone'] as const);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors<'name' | 'phone'> = {};
    if (!name.trim()) {
      next.name = '请填写姓名';
    }
    if (!phone.trim()) {
      next.phone = '请填写手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      next.phone = '请输入有效的 11 位手机号';
    }
    if (Object.keys(next).length > 0) {
      showErrors(next);
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
    <form onSubmit={handleSubmit} ref={formRef} className="space-y-4" noValidate>
      <div>
        <FieldLabel htmlFor="reg-name" required>姓名</FieldLabel>
        <Input
          id="reg-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
          placeholder="请输入真实姓名…"
          maxLength={50}
          invalid={!!errors.name}
          aria-describedby={errors.name ? 'reg-name-error' : undefined}
        />
        <FieldError id="reg-name-error">{errors.name}</FieldError>
      </div>

      <div>
        <FieldLabel htmlFor="reg-phone" required>手机号</FieldLabel>
        <Input
          id="reg-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearError('phone');
          }}
          placeholder="请输入手机号…"
          maxLength={20}
          invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
        />
        <FieldError id="reg-phone-error">{errors.phone}</FieldError>
      </div>

      <div>
        <FieldLabel htmlFor="reg-message">留言（可选）</FieldLabel>
        <Textarea
          id="reg-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="可补充报名说明…"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-brown-muted mt-1 text-right">{message.length}/200</div>
      </div>

      <Button type="submit" block loading={loading} disabled={loading}>
        {loading ? '提交中' : '提交报名'}
      </Button>
    </form>
  );
};
