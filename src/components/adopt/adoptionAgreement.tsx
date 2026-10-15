import { useState } from 'react';
import { signAgreement } from '../../api/adopt';
import { AdoptionApplicationInfo } from '../../types/adopt';
import { useToast } from '../toast';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { FieldLabel, Input } from '../ui/input';
import { Modal } from '../ui/modal';

interface AdoptionAgreementProps {
  application: AdoptionApplicationInfo;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdoptionAgreement = ({ application, onClose, onSuccess }: AdoptionAgreementProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [checked, setChecked] = useState(false);
  const [signature, setSignature] = useState('');

  const agreementText = `
领养协议

一、领养人承诺
1. 我有稳定住所和经济能力，能够为宠物提供良好的生活环境
2. 我承诺定期带宠物进行健康检查和疫苗接种
3. 我承诺不虐待、遗弃宠物，并给予其充分关爱
4. 我同意配合必要的回访检查

二、领养条件
1. 领养宠物后，如因特殊原因无法继续养育，应联系原主人协助处理
2. 遵守当地养宠相关法律法规
3. 确保宠物不影响他人正常生活

三、免责条款
1. 原主人已如实告知宠物健康状况
2. 领养后宠物的健康问题由领养人负责

本人已阅读并同意以上条款，承诺认真履行领养义务。
`;

  const handleSign = () => {
    if (!checked) {
      toast.error('请先阅读并同意协议条款');
      return;
    }
    if (!signature.trim()) {
      toast.error('请签署您的姓名');
      return;
    }

    run(
      () => signAgreement({
        applicationId: application.id,
        agreementText: agreementText,
        signature: signature.trim(),
      }),
      () => onSuccess(),
      () => toast.error('协议签署失败'),
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="领养协议"
      size="md"
      footer={
        <>
          <Button variant="ghost" className="flex-1 bg-muted" onClick={onClose}>
            取消
          </Button>
          <Button className="flex-1" disabled={loading || !checked} loading={loading} onClick={handleSign}>
            {loading ? '签署中...' : '确认签署'}
          </Button>
        </>
      }
    >
      <div className="bg-cream rounded-lg p-3 mb-4 text-sm text-brown-secondary whitespace-pre-wrap max-h-48 overflow-y-auto">
        {agreementText}
      </div>

      <div className="mb-4">
        <Checkbox checked={checked} onChange={setChecked}>
          我已阅读并同意以上条款
        </Checkbox>
      </div>

      <div>
        <FieldLabel required>电子签名（您的姓名）</FieldLabel>
        <Input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="请输入您的姓名作为电子签名"
        />
      </div>
    </Modal>
  );
};
