import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdBanner } from './AdBanner';
import { Advertisement } from '../../types/advertisement';
import { ToastProvider } from '../toast';

// 集中 mock ad API:useActiveAds 内部 useAsyncEffect 会触发 getActiveAds,
// 我们通过控制 mockGetActiveAds 的返回值驱动各分支
const mockGetActiveAds = vi.fn();
const mockIncrementAdView = vi.fn().mockResolvedValue(undefined);
const mockIncrementAdClick = vi.fn().mockResolvedValue(undefined);

vi.mock('../../api/ad', () => ({
  getActiveAds: (...args: unknown[]) => mockGetActiveAds(...args),
  incrementAdView: (id: number) => mockIncrementAdView(id),
  incrementAdClick: (id: number) => mockIncrementAdClick(id),
}));

const baseAd: Advertisement = {
  id: 101,
  positionId: 1,
  position: {
    id: 1,
    name: 'Home Banner',
    location: 'home_banner',
    size: '750x300',
    status: 1,
    createdAt: '2026-08-28 10:00:00',
    updatedAt: '2026-08-28 10:00:00',
  },
  title: '新春大促',
  imageUrl: '/img/ad.png',
  linkUrl: 'https://example.com/promo',
  startTime: '2026-08-01 00:00:00',
  endTime: '2026-08-31 23:59:59',
  viewCount: 0,
  clickCount: 0,
  status: 1,
  createdBy: 1,
  createdAt: '2026-08-28 10:00:00',
  updatedAt: '2026-08-28 10:00:00',
};

const renderWith = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>
  );

describe('AdBanner 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveAds.mockReset();
    mockIncrementAdView.mockClear();
    mockIncrementAdClick.mockClear();
  });

  it('无广告数据时返回 null (不渲染任何节点)', async () => {
    mockGetActiveAds.mockResolvedValue([]);
    const { container } = renderWith(<AdBanner location="home_banner" />);
    await waitFor(() => expect(mockGetActiveAds).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });

  it('渲染广告标题与图片,并自动上报 PV', async () => {
    mockGetActiveAds.mockResolvedValue([baseAd]);
    renderWith(<AdBanner location="home_banner" />);

    await waitFor(() => expect(mockGetActiveAds).toHaveBeenCalledWith('home_banner'));
    const img = await screen.findByAltText('新春大促');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/ad.png');

    // 首次渲染后 fire-and-forget 上报 PV
    await waitFor(() => {
      expect(mockIncrementAdView).toHaveBeenCalledWith(baseAd.id);
    });
  });

  it('点击广告触发 incrementAdClick 且保留 href 跳转', async () => {
    mockGetActiveAds.mockResolvedValue([baseAd]);
    renderWith(<AdBanner location="home_banner" />);

    const link = await screen.findByRole('link', { name: /广告: 新春大促/ });
    expect(link).toHaveAttribute('href', 'https://example.com/promo');
    expect(link).toHaveAttribute('target', '_blank');

    fireEvent.click(link);
    await waitFor(() => {
      expect(mockIncrementAdClick).toHaveBeenCalledWith(baseAd.id);
    });
  });

  it('rel 包含 sponsored/noopener/noreferrer', async () => {
    mockGetActiveAds.mockResolvedValue([baseAd]);
    renderWith(<AdBanner location="home_banner" />);
    const link = await screen.findByRole('link', { name: /广告: 新春大促/ });
    const rel = link.getAttribute('rel') ?? '';
    expect(rel).toMatch(/sponsored/);
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it('linkUrl 为空时渲染为非交互 div,不上报 Click', async () => {
    const noLinkAd = { ...baseAd, linkUrl: '' };
    mockGetActiveAds.mockResolvedValue([noLinkAd]);
    renderWith(<AdBanner location="detail_sidebar" />);

    const img = await screen.findByAltText('新春大促');
    expect(img).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    expect(mockIncrementAdView).toHaveBeenCalledWith(noLinkAd.id);
  });

  it('limit 截断:仅渲染前 N 条广告', async () => {
    const ads = [
      { ...baseAd, id: 1, title: 'ad-1' },
      { ...baseAd, id: 2, title: 'ad-2' },
      { ...baseAd, id: 3, title: 'ad-3' },
    ];
    mockGetActiveAds.mockResolvedValue(ads);
    renderWith(<AdBanner location="topic_banner" limit={2} />);

    await waitFor(() => expect(mockGetActiveAds).toHaveBeenCalled());
    expect(screen.getByAltText('ad-1')).toBeInTheDocument();
    expect(screen.getByAltText('ad-2')).toBeInTheDocument();
    expect(screen.queryByAltText('ad-3')).toBeNull();
  });
});
