import React from 'react';
import { Coins, Minus, Plus, Star } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { usePoints } from '../../hooks/usePoints';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs } from '../../components/ui/tabs';
import './pointsPage.scss';

const PointsPage: React.FC = () => {
  const {
    userLevel,
    records,
    rules,
    benefits,
    loading,
    activeTab,
    setActiveTab,
    getProgress,
  } = usePoints();

  return (
    <div className="points-page">
      <PageHeader title="积分中心" fallbackTo="/profile" />

      {userLevel && (
        <Card className="level-card" padding="md">
          <div className="level-info">
            <div className="level-badge">Lv.{userLevel.level}</div>
            <div className="level-name">{userLevel.levelName}</div>
          </div>
          <div className="points-info">
            <div className="points-value">{userLevel.currentPoints}</div>
            <div className="points-label">积分</div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
          </div>
          <div className="progress-text">
            {userLevel.currentPoints} / {userLevel.maxPoints}
          </div>
        </Card>
      )}

      <div className="tab-bar">
        <Tabs
          listOnly
          className="w-full"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as typeof activeTab)}
          items={[
            { key: 'records', title: '积分记录' },
            { key: 'rules', title: '积分规则' },
            { key: 'benefits', title: '等级权益' },
          ]}
        />
      </div>

      <div className="content-area">
        {loading ? (
          <div className="records-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="record-item">
                <Skeleton circle className="w-10 h-10 shrink-0" />
                <div className="record-info flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : activeTab === 'records' ? (
          records.length === 0 ? (
            <EmptyState compact title="暂无积分记录" />
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-icon">
                    {record.points > 0 ? (
                      <Plus
                        size={ICON_SIZE.action}
                        strokeWidth={iconStroke(ICON_SIZE.action)}
                        className="text-primary-text"
                        aria-hidden="true"
                      />
                    ) : (
                      <Minus
                        size={ICON_SIZE.action}
                        strokeWidth={iconStroke(ICON_SIZE.action)}
                        className="text-brown-muted"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="record-info">
                    <div className="record-desc">{record.description}</div>
                    <div className="record-time">{record.createdAt}</div>
                  </div>
                  <div className={`record-points ${record.points > 0 ? 'gain' : 'lose'}`}>
                    {record.points > 0 ? '+' : ''}{record.points}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'rules' ? (
          rules.length === 0 ? (
            <EmptyState compact title="暂无积分规则" />
          ) : (
            <div className="rules-list">
              {rules.map((rule) => (
                <div key={rule.id} className="rule-item">
                  <div className="rule-icon">
                    <Coins
                      size={ICON_SIZE.nav}
                      strokeWidth={iconStroke(ICON_SIZE.nav)}
                      className="text-primary-text"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="rule-info">
                    <div className="rule-name">{rule.description}</div>
                    <div className="rule-limit">每日上限 {rule.dailyLimit} 分</div>
                  </div>
                  <div className="rule-points">+{rule.points}</div>
                </div>
              ))}
            </div>
          )
        ) : (
          benefits.length === 0 ? (
            <EmptyState compact title="暂无等级权益" />
          ) : (
            <div className="benefits-list">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="benefit-item">
                  <div className="benefit-icon">
                    <Star
                      size={ICON_SIZE.nav}
                      strokeWidth={iconStroke(ICON_SIZE.nav)}
                      className="text-warning"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="benefit-info">
                    <div className="benefit-name">{benefit.benefitName}</div>
                    <div className="benefit-desc">{benefit.benefitDesc}</div>
                  </div>
                  <div className="benefit-level">Lv.{benefit.level}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PointsPage;
