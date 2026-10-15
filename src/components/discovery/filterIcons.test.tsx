import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PetIcon, PostIcon } from './filterIcons';

describe('PetIcon', () => {
  it('应渲染 dog 类型图标', () => {
    const { container } = render(<PetIcon type="dog" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('应渲染 cat 类型图标', () => {
    const { container } = render(<PetIcon type="cat" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('未知类型应回退到 other 图标', () => {
    const { container: other } = render(<PetIcon type="other" />);
    const { container: unknown } = render(<PetIcon type="dinosaur" />);
    expect(other.querySelector('svg')?.innerHTML).toBe(unknown.querySelector('svg')?.innerHTML);
  });

  it('应支持自定义尺寸和颜色', () => {
    const { container } = render(<PetIcon type="bird" size={32} color="#3D9B8F" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('stroke', '#3D9B8F');
  });
});

describe('PostIcon', () => {
  it('应渲染 image 类型图标', () => {
    const { container } = render(<PostIcon type="image" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('应渲染 video 类型图标', () => {
    const { container } = render(<PostIcon type="video" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('未知类型应回退到 text 图标', () => {
    const { container: text } = render(<PostIcon type="text" />);
    const { container: unknown } = render(<PostIcon type="audio" />);
    expect(text.querySelector('svg')?.innerHTML).toBe(unknown.querySelector('svg')?.innerHTML);
  });
});
