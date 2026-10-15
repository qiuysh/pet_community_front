import { useState } from 'react';
import { SubmissionInfo, AwardRequest } from '../../types/activity';
import { useToast } from '../toast';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { FieldLabel } from '../ui/input';

interface AwardSettingProps {
  submissions: SubmissionInfo[];
  selectedAward: 'first' | 'second' | 'third';
  onAwardChange: (award: 'first' | 'second' | 'third') => void;
  onSubmit: (awards: AwardRequest[]) => void;
}

export const AwardSetting = ({ submissions, selectedAward, onAwardChange, onSubmit }: AwardSettingProps) => {
  const toast = useToast();
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const { loading, run } = useAsync();

  const awardLimits = {
    first: 1,
    second: 2,
    third: 3,
  };

  const awardLabels = {
    first: '一等奖',
    second: '二等奖',
    third: '三等奖',
  };

  const awardColors = {
    first: 'bg-error',
    second: 'bg-rank-gold',
    third: 'bg-rank-bronze',
  };

  const handleCheckboxChange = (submissionId: number) => {
    const limit = awardLimits[selectedAward];
    const alreadyAwardedAsOtherLevel = submissions.find(s => s.id === submissionId && s.isAwarded && s.awardLevel !== selectedAward);

    if (alreadyAwardedAsOtherLevel) {
      toast.warning('该作品已获得其他奖项，无法重复设置');
      return;
    }

    if (selectedSubmissions.includes(submissionId)) {
      setSelectedSubmissions(selectedSubmissions.filter(id => id !== submissionId));
    } else {
      if (selectedSubmissions.length >= limit) {
        toast.warning(`${awardLabels[selectedAward]}最多选择 ${limit} 个作品`);
        return;
      }
      setSelectedSubmissions([...selectedSubmissions, submissionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedSubmissions.length === 0) {
      toast.warning('请选择获奖作品');
      return;
    }

    const awards: AwardRequest[] = selectedSubmissions.map(submissionId => ({
      submissionId,
      award: selectedAward,
      rank: selectedSubmissions.indexOf(submissionId) + 1,
    }));

    run(
      async () => {
        onSubmit(awards);
        setSelectedSubmissions([]);
      },
    );
  };

  const availableSubmissions = submissions.filter(s => !s.isAwarded || s.awardLevel === selectedAward);

  return (
    <div className="bg-white rounded-lg border border-border-light p-4">
      <h3 className="text-lg font-semibold text-brown mb-4">设置获奖</h3>

      <div className="mb-4">
        <FieldLabel className="mb-2">奖项等级</FieldLabel>
        <div className="flex gap-2">
          {(['first', 'second', 'third'] as const).map(award => (
            <Button
              key={award}
              type="button"
              variant="ghost"
              className={`flex-1 py-2 text-sm font-medium ${
                selectedAward === award
                  ? `${awardColors[award]} text-white`
                  : 'bg-muted text-brown-muted hover:bg-border-light'
              }`}
              onClick={() => {
                onAwardChange(award);
                setSelectedSubmissions([]);
              }}
            >
              {awardLabels[award]} ({awardLimits[award]})
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <FieldLabel className="mb-2">
          选择作品 ({selectedSubmissions.length}/{awardLimits[selectedAward]})
        </FieldLabel>
        <div className="max-h-60 overflow-y-auto border border-border-light rounded">
          {availableSubmissions.length === 0 ? (
            <div className="p-3 text-center text-sm text-brown-muted">
              暂无可选作品
            </div>
          ) : (
            availableSubmissions.map(submission => (
              <div key={submission.id} className="flex items-center gap-3 p-3 border-b border-border-light last:border-b-0">
                <input
                  type="checkbox"
                  checked={selectedSubmissions.includes(submission.id) || (submission.isAwarded && submission.awardLevel === selectedAward)}
                  onChange={() => handleCheckboxChange(submission.id)}
                  disabled={submission.isAwarded && submission.awardLevel === selectedAward}
                  className="w-4 h-4 rounded border-border-light"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brown truncate">{submission.title}</p>
                  <p className="text-xs text-brown-muted">{submission.votesCount} 票</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Button
        type="button"
        block
        onClick={handleSubmit}
        disabled={selectedSubmissions.length === 0}
        loading={loading}
      >
        设置获奖
      </Button>
    </div>
  );
};
