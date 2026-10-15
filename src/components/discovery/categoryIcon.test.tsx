import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CategoryIcon } from './categoryIcon';

describe('CategoryIcon', () => {
  it('应渲染已知分类的图标', () => {
    const { container } = render(<CategoryIcon categoryName="萌宠日常" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });

  it('应渲染自定义尺寸和颜色', () => {
    const { container } = render(<CategoryIcon categoryName="养宠知识" size={40} color="#F0785A" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
    expect(svg).toHaveAttribute('stroke', '#F0785A');
  });

  it('未知分类应渲染默认图标', () => {
    const { container: known } = render(<CategoryIcon categoryName="萌宠日常" />);
    const { container: unknown } = render(<CategoryIcon categoryName="不存在的分类" />);
    expect(known.querySelector('svg')?.innerHTML).not.toBe(unknown.querySelector('svg')?.innerHTML);
  });

  it('应包含 path 子元素', () => {
    const { container } = render(<CategoryIcon categoryName="宠物健康" />);
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});
