import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/adopt', () => ({
  createFollowUp: vi.fn(),
  uploadAdoptPhoto: vi.fn(),
}));

import { createFollowUp, uploadAdoptPhoto } from '../../api/adopt';
import { AdoptionFollowUpPanel } from './adoptionFollowUpPanel';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

describe('AdoptionFollowUpPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createFollowUp).mockResolvedValue({ id: 1 } as never);
    vi.mocked(uploadAdoptPhoto).mockResolvedValue({ url: '/api/v1/uploads/a.jpg' });
  });

  it('内容为空时不提交', () => {
    renderWithToast(<AdoptionFollowUpPanel adoptionId={3} applicationId={9} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '提交回访' }));
    expect(createFollowUp).not.toHaveBeenCalled();
  });

  it('提交时带上领养/申请 ID 与类型、内容', async () => {
    const onSuccess = vi.fn();
    renderWithToast(
      <AdoptionFollowUpPanel adoptionId={3} applicationId={9} onSuccess={onSuccess} />,
    );

    fireEvent.click(screen.getByRole('button', { name: '照片回访' }));
    fireEvent.change(screen.getByLabelText('回访内容'), { target: { value: '猫咪适应得很好' } });
    fireEvent.click(screen.getByRole('button', { name: '提交回访' }));

    await waitFor(() =>
      expect(createFollowUp).toHaveBeenCalledWith({
        adoptionId: 3,
        applicationId: 9,
        followUpType: 'photo',
        content: '猫咪适应得很好',
        photos: [],
        status: 1,
      }),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('上传的图片地址进入提交参数', async () => {
    renderWithToast(<AdoptionFollowUpPanel adoptionId={3} applicationId={9} onSuccess={() => {}} />);
    const file = new File(['x'], 'cat.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('上传回访照片'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByAltText('回访照片 1')).toBeTruthy());

    fireEvent.change(screen.getByLabelText('回访内容'), { target: { value: '照片回访' } });
    fireEvent.click(screen.getByRole('button', { name: '提交回访' }));

    await waitFor(() =>
      expect(createFollowUp).toHaveBeenCalledWith(
        expect.objectContaining({ photos: ['/api/v1/uploads/a.jpg'] }),
      ),
    );
  });
});
