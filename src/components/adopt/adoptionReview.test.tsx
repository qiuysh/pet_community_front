import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/adopt', () => ({
  createApplication: vi.fn(),
  reviewApplication: vi.fn(),
  signAgreement: vi.fn(),
}));

import { createApplication, reviewApplication, signAgreement } from '../../api/adopt';
import { AdoptionApplyForm } from './adoptionApplyForm';
import { AdoptionReview } from './adoptionReview';
import { AdoptionAgreement } from './adoptionAgreement';
import { AdoptionApplicationInfo } from '../../types/adopt';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseApplication: AdoptionApplicationInfo = {
  id: 1,
  adoptionId: 10,
  userId: 100,
  userNickname: '申请人',
  userAvatar: '',
  applicationInfo: '我想领养这只宠物，我有大房子',
  status: 0,
  reviewedBy: 0,
  reviewedAt: '',
  agreementSigned: false,
  createdAt: '2024-01-01 10:00:00',
  updatedAt: '2024-01-01 10:00:00',
};

describe('AdoptionApplyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染表单标题和说明', () => {
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('申请领养')).toBeInTheDocument();
    expect(screen.getByText(/申请理由/)).toBeInTheDocument();
  });

  it('关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByLabelText('关闭'));
    expect(onClose).toHaveBeenCalled();
  });

  it('取消按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('空申请理由时不调用 API', async () => {
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '提交申请' }));
    await waitFor(() => {
      expect(createApplication).not.toHaveBeenCalled();
    });
  });

  it('提交成功调用 onSuccess', async () => {
    vi.mocked(createApplication).mockResolvedValue(baseApplication);
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '我想领养，有经验' } });
    fireEvent.click(screen.getByRole('button', { name: '提交申请' }));
    await waitFor(() => {
      expect(createApplication).toHaveBeenCalledWith({
        adoptionId: 1,
        applicationInfo: '我想领养，有经验',
      });
      expect(onSuccess).toHaveBeenCalledWith(baseApplication);
    });
  });

  it('提交失败时显示错误', async () => {
    vi.mocked(createApplication).mockRejectedValue(new Error('网络错误'));
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '提交申请' }));
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('显示温馨提示内容', () => {
    renderWithToast(
      <AdoptionApplyForm adoptionId={1} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText(/领养前请确保有稳定住所/)).toBeInTheDocument();
  });
});

describe('AdoptionReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染申请信息', () => {
    renderWithToast(
      <AdoptionReview application={baseApplication} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('审核申请')).toBeInTheDocument();
    expect(screen.getByText('申请人')).toBeInTheDocument();
    expect(screen.getByText('我想领养这只宠物，我有大房子')).toBeInTheDocument();
  });

  it('关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <AdoptionReview application={baseApplication} onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByLabelText('关闭'));
    expect(onClose).toHaveBeenCalled();
  });

  it('通过按钮调用审核接口', async () => {
    vi.mocked(reviewApplication).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionReview application={baseApplication} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '通过' }));
    await waitFor(() => {
      expect(reviewApplication).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('点击拒绝按钮不立即调用 API', () => {
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionReview application={baseApplication} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '拒绝' }));
    expect(reviewApplication).not.toHaveBeenCalled();
  });

  it('审核失败时显示错误', async () => {
    vi.mocked(reviewApplication).mockRejectedValue(new Error('error'));
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionReview application={baseApplication} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '通过' }));
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});

describe('AdoptionAgreement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染协议标题和内容', () => {
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('领养协议')).toBeInTheDocument();
    expect(screen.getByText(/领养人承诺/)).toBeInTheDocument();
    expect(screen.getByText(/领养条件/)).toBeInTheDocument();
    expect(screen.getByText(/免责条款/)).toBeInTheDocument();
  });

  it('渲染复选框和签名输入框', () => {
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入您的姓名作为电子签名')).toBeInTheDocument();
  });

  it('未勾选时签署按钮禁用', () => {
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByRole('button', { name: '确认签署' })).toBeDisabled();
  });

  it('勾选后启用签署按钮', () => {
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: '确认签署' })).not.toBeDisabled();
  });

  it('签署成功调用 onSuccess', async () => {
    vi.mocked(signAgreement).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByPlaceholderText('请输入您的姓名作为电子签名'), { target: { value: '张三' } });
    fireEvent.click(screen.getByRole('button', { name: '确认签署' }));
    await waitFor(() => {
      expect(signAgreement).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('签署失败不调用 onSuccess', async () => {
    vi.mocked(signAgreement).mockRejectedValue(new Error('error'));
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByPlaceholderText('请输入您的姓名作为电子签名'), { target: { value: '张三' } });
    fireEvent.click(screen.getByRole('button', { name: '确认签署' }));
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('取消按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <AdoptionAgreement application={baseApplication} onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalled();
  });
});
