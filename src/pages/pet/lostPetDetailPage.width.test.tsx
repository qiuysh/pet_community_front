import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import { LostPetDetailPage } from './lostPetDetailPage';
import { getLostPetDetail } from '../../api/pet';
import { LOST_PET_STATUS } from '../../utils/lostPetShare';

vi.mock('../../api/pet', () => ({
  getLostPetDetail: vi.fn(),
  recordLostPetShare: vi.fn(),
  updateLostPetStatus: vi.fn(),
}));

const item = {
  id: 9,
  petName: '豆豆',
  description: '在公园走失',
  lostLocation: '上海',
  lostTime: '2026-11-01',
  contact: '13800000000',
  status: LOST_PET_STATUS.searching,
  userId: 1,
  images: [],
  sharesCount: 0,
};

describe('LostPetDetailPage 列宽结构 §5.5', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLostPetDetail).mockResolvedValue(item as never);
  });

  it('正文 page-shell 无水平 px，卡片落在与 PageHeader 同列的壳内', async () => {
    const { container } = render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/lost-pets/9']}>
          <Routes>
            <Route path="/lost-pets/:id" element={<LostPetDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('豆豆')).toBeInTheDocument();
    });

    const headerShell = container.querySelector('header .page-shell');
    expect(headerShell).toBeTruthy();

    const bodyShell = container.querySelector('.page-shell.space-y-4.py-4');
    expect(bodyShell).toBeTruthy();
    expect(bodyShell?.className).not.toMatch(/\bpx-4\b/);

    const card = bodyShell?.querySelector('[data-slot="card"]');
    expect(card).toBeTruthy();
    expect(bodyShell?.contains(card as Node)).toBe(true);
  });
});
