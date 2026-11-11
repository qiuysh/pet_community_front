import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CategoryIcon } from './categoryIcon';
import { ICON_SIZE } from '../../styles/iconSize';

describe('CategoryIcon', () => {
  it('应渲染已知分类的图标', () => {
    const { container } = render(<CategoryIcon categoryName="日常分享" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', String(ICON_SIZE.feature));
    expect(svg).toHaveAttribute('height', String(ICON_SIZE.feature));
  });

  it('应渲染自定义尺寸和颜色', () => {
    const { container } = render(<CategoryIcon categoryName="养宠知识" size={40} color="#F0785A" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
    expect(svg).toHaveAttribute('stroke', '#F0785A');
  });

  it('种子分类应各自映射不同图标', () => {
    const names = ['日常分享', '养宠知识', '美食教程', '健康医疗', '萌宠趣事'];
    const paths = names.map((name) => {
      const { container } = render(<CategoryIcon categoryName={name} />);
      return container.querySelector('svg')?.innerHTML ?? '';
    });
    expect(new Set(paths).size).toBe(names.length);
  });

  it('未知分类应渲染默认图标（与已知分类不同）', () => {
    const { container: known } = render(<CategoryIcon categoryName="日常分享" />);
    const { container: unknown } = render(<CategoryIcon categoryName="不存在的分类" />);
    expect(known.querySelector('svg')?.innerHTML).not.toBe(unknown.querySelector('svg')?.innerHTML);
  });

  it('应包含 path 子元素', () => {
    const { container } = render(<CategoryIcon categoryName="健康医疗" />);
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});
