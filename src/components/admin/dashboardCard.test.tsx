import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardCard } from './dashboardCard';

describe('DashboardCard', () => {
  it('渲染卡片 label 和 value', () => {
    render(
      <DashboardCard
        label="用户总数"
        value="1234"
        icon={<span data-testid="icon">I</span>}
        iconTone="bg-secondary-soft text-secondary"
      />
    );
    expect(screen.getByText('用户总数')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('显示变化数据（change 上升）', () => {
    render(
      <DashboardCard
        label="用户"
        value={100}
        change="+10%"
        changeType="up"
        icon={<span>I</span>}
      />
    );
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('较昨日')).toBeInTheDocument();
  });

  it('支持自定义 changeLabel 与 hint', () => {
    render(
      <DashboardCard
        label="用户"
        value={100}
        change="+1%"
        changeType="up"
        changeLabel="较上周"
        hint="累计 999"
        icon={<span>I</span>}
      />,
    );
    expect(screen.getByText('较上周')).toBeInTheDocument();
    expect(screen.getByText('累计 999')).toBeInTheDocument();
  });

  it('显示变化数据（change 下降）', () => {
    render(
      <DashboardCard
        label="用户"
        value={100}
        change="-5%"
        changeType="down"
        icon={<span>I</span>}
      />
    );
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('没有 change 时不显示变化区域', () => {
    render(
      <DashboardCard
        label="用户"
        value={100}
        icon={<span>I</span>}
      />
    );
    expect(screen.queryByText('较昨日')).not.toBeInTheDocument();
  });
});

