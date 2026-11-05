import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFormErrors } from './useFormErrors';

function DemoForm() {
  const { errors, showErrors, clearError, formRef } = useFormErrors(['name', 'phone'] as const);

  return (
    <form ref={formRef}>
      <input
        name="name"
        aria-label="姓名"
        aria-invalid={errors.name ? true : undefined}
        onChange={() => clearError('name')}
      />
      <input
        name="phone"
        aria-label="手机号"
        aria-invalid={errors.phone ? true : undefined}
        onChange={() => clearError('phone')}
      />
      <button
        type="button"
        onClick={() => showErrors({ name: '请输入姓名', phone: '请输入手机号' })}
      >
        提交
      </button>
      <p role="alert">{errors.name}</p>
      <p role="alert">{errors.phone}</p>
    </form>
  );
}

describe('useFormErrors', () => {
  it('一次性展示全部字段错误，并聚焦第一个非法字段', async () => {
    render(<DemoForm />);

    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    expect(screen.getByText('请输入姓名')).toBeInTheDocument();
    expect(screen.getByText('请输入手机号')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('姓名')).toHaveFocus());
  });

  it('修改字段后清除该字段错误，其他字段错误保留', () => {
    render(<DemoForm />);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    fireEvent.change(screen.getByLabelText('姓名'), { target: { value: '张三' } });

    expect(screen.queryByText('请输入姓名')).not.toBeInTheDocument();
    expect(screen.getByText('请输入手机号')).toBeInTheDocument();
  });
});
