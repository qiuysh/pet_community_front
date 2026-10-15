import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdoptCard } from './adoptCard';
import { AdoptInfo, PetType, AdoptionStatus } from '../../types/adopt';
import { ToastProvider } from '../toast';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>
  );
};

const baseAdopt: AdoptInfo = {
  id: 1,
  petId: 1,
  petName: '小白',
  petType: PetType.DOG,
  petGender: 1,
  petAge: '2岁',
  healthStatus: '健康',
  description: '友善可爱的小狗，寻找有爱心的主人',
  photos: ['https://example.com/photo1.jpg'],
  adoptConditions: '有院子',
  contactPhone: '13800138000',
  status: AdoptionStatus.PENDING,
  applicationCount: 3,
  location: '北京',
  createdAt: '2024-01-01 10:00:00',
  updatedAt: '2024-01-01 10:00:00',
  userId: 1,
  userNickname: 'user1',
  userAvatar: '',
};

describe('AdoptCard', () => {
  it('渲染领养卡片基本信息', () => {
    renderWithProviders(<AdoptCard adopt={baseAdopt} />);
    expect(screen.getByText('小白')).toBeInTheDocument();
    expect(screen.getByText('待领养')).toBeInTheDocument();
    expect(screen.getByText('3 人申请')).toBeInTheDocument();
    expect(screen.getByText('友善可爱的小狗，寻找有爱心的主人')).toBeInTheDocument();
  });

  it('显示宠物类型标签', () => {
    renderWithProviders(<AdoptCard adopt={baseAdopt} />);
    expect(screen.getByText('狗狗')).toBeInTheDocument();
  });

  it('公狗显示性别标记', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petGender: 1 }} />);
    expect(screen.getByText('· 公')).toBeInTheDocument();
  });

  it('母狗显示性别标记', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petGender: 2 }} />);
    expect(screen.getByText('· 母')).toBeInTheDocument();
  });

  it('渲染宠物类型：猫咪', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petType: PetType.CAT }} />);
    expect(screen.getByText('猫咪')).toBeInTheDocument();
  });

  it('渲染宠物类型：鸟类', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petType: PetType.BIRD }} />);
    expect(screen.getByText('鸟类')).toBeInTheDocument();
  });

  it('渲染宠物类型：鱼类', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petType: PetType.FISH }} />);
    expect(screen.getByText('鱼类')).toBeInTheDocument();
  });

  it('渲染宠物类型：其他', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petType: PetType.OTHER }} />);
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('已领养状态显示', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, status: AdoptionStatus.ADOPTED }} />);
    expect(screen.getByText('已领养')).toBeInTheDocument();
  });

  it('已取消状态显示', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, status: AdoptionStatus.CANCELLED }} />);
    expect(screen.getByText('已取消')).toBeInTheDocument();
  });

  it('显示宠物照片', () => {
    renderWithProviders(<AdoptCard adopt={baseAdopt} />);
    const img = screen.getByAltText('小白');
    expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg');
  });

  it('没有照片时不渲染图片', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, photos: [] }} />);
    expect(screen.queryByAltText('小白')).not.toBeInTheDocument();
  });

  it('显示位置信息', () => {
    renderWithProviders(<AdoptCard adopt={baseAdopt} />);
    expect(screen.getByText('北京')).toBeInTheDocument();
  });

  it('点击卡片跳转到详情页', () => {
    renderWithProviders(<AdoptCard adopt={baseAdopt} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/adopts/1');
  });

  it('无宠物年龄时仅显示类型', () => {
    renderWithProviders(<AdoptCard adopt={{ ...baseAdopt, petAge: '' }} />);
    expect(screen.getByText('狗狗')).toBeInTheDocument();
  });
});
