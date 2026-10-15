import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldLabel, Input, Select, Textarea } from './input';

describe('Input', () => {
  it('renders and accepts input', () => {
    const onChange = vi.fn();
    render(<Input placeholder="昵称" onChange={onChange} aria-label="昵称" />);
    const el = screen.getByPlaceholderText('昵称');
    fireEvent.change(el, { target: { value: '咪咪' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('marks invalid state', () => {
    render(<Input invalid aria-label="标题" />);
    expect(screen.getByLabelText('标题')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Textarea', () => {
  it('renders multiline control', () => {
    render(<Textarea placeholder="介绍" rows={3} aria-label="介绍" />);
    expect(screen.getByPlaceholderText('介绍')).toBeInTheDocument();
  });
});

describe('Select', () => {
  it('renders HeroUI select with options', () => {
    render(
      <Select aria-label="类型" defaultValue="dog">
        <option value="cat">猫</option>
        <option value="dog">狗</option>
      </Select>
    );
    expect(screen.getByRole('button', { name: /类型|狗/ })).toBeInTheDocument();
  });
});

describe('FieldLabel', () => {
  it('shows required mark', () => {
    render(<FieldLabel required>宠物名称</FieldLabel>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
