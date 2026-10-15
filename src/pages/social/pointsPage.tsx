import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Clock, Star } from 'lucide-react';
import { usePoints } from '../../hooks/usePoints';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs } from '../../components/ui/tabs';
import './pointsPage.scss';

const PointsPage: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">积分中心</h1>
        <div className="placeholder" />
      </div>

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
            <div className="empty">暂无积分记录</div>
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-icon">
                    {record.points > 0 ? (
                      <Check size={20} color="var(--color-primary)" />
                    ) : (
                      <X size={20} color="var(--color-ink-muted)" />
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
            <div className="empty">暂无积分规则</div>
          ) : (
            <div className="rules-list">
              {rules.map((rule) => (
                <div key={rule.id} className="rule-item">
                  <div className="rule-icon">
                    <Clock size={24} color="var(--color-primary)" />
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
            <div className="empty">暂无等级权益</div>
          ) : (
            <div className="benefits-list">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="benefit-item">
                  <div className="benefit-icon">
                    <Star size={24} color="var(--color-warning)" />
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
