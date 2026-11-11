import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import { MyAdoptPage } from './myAdoptPage';
import { AdoptionStatus, ApplicationStatus } from '../../types/adopt';
import {
  cancelApplication,
  deleteAdopt,
  getMyAdoptList,
  getMyApplicationList,
  updateAdoptStatus,
} from '../../api/adopt';

vi.mock('../../api/adopt', () => ({
  getMyAdoptList: vi.fn(),
  getMyApplicationList: vi.fn(),
  cancelApplication: vi.fn(),
  deleteAdopt: vi.fn(),
  updateAdoptStatus: vi.fn(),
}));

const adopt = {
  id: 5,
  petId: 1,
  userId: 7,
  userNickname: '我',
  userAvatar: '',
  petName: '奶糖',
  petType: 1,
  petAge: '1岁',
  petGender: 2,
  healthStatus: '健康',
  photos: [],
  description: '很乖的猫咪',
  adoptConditions: '有稳定住所',
  location: '杭州',
  contactPhone: '13800000000',
  status: AdoptionStatus.PENDING,
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
};

const application = {
  id: 9,
  adoptionId: 3,
  userId: 7,
  userNickname: '我',
  userAvatar: '',
  applicationInfo: '我家有院子',
  status: ApplicationStatus.PENDING,
  reviewedBy: 0,
  reviewedAt: '',
  agreementSigned: false,
  createdAt: '2026-11-02T10:00:00Z',
  updatedAt: '2026-11-02T10:00:00Z',
};

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/adopts/mine']}>
        <MyAdoptPage />
      </MemoryRouter>
    </ToastProvider>,
  );

describe('MyAdoptPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMyAdoptList).mockResolvedValue({ list: [adopt], total: 1 } as never);
    vi.mocked(getMyApplicationList).mockResolvedValue({ list: [application], total: 1 } as never);
    vi.mocked(cancelApplication).mockResolvedValue(undefined as never);
    vi.mocked(updateAdoptStatus).mockResolvedValue(undefined as never);
    vi.mocked(deleteAdopt).mockResolvedValue(undefined as never);
  });

  it('默认展示我的送养信息', async () => {
    renderPage();
    expect(await screen.findByText('奶糖')).toBeInTheDocument();
  });

  it('切换到我提交的申请并可取消', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('tab', { name: /我的申请/ }));

    expect(await screen.findByText('我家有院子')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消申请' }));
    fireEvent.click(await screen.findByRole('button', { name: '取消申请' }));

    await waitFor(() => {
      expect(cancelApplication).toHaveBeenCalledWith(9);
    });
  });
});
