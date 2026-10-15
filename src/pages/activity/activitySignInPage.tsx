import { useActivitySignIn } from '../../hooks/useActivitySignIn';
import { QRCodeGenerator } from '../../components/activity/qrCodeGenerator';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';

export const ActivitySignInPage = () => {
  const {
    activity,
    signInList,
    signInStats,
    loading,
    isSigningIn,
    activeTab,
    setActiveTab,
    scanQRCode,
    setScanQRCode,
    signInLocation,
    setSignInLocation,
    handleSignIn,
    activityId,
  } = useActivitySignIn();

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !activity) {
    return <div className="min-h-dvh flex items-center justify-center">加载中…</div>;
  }

  return (
    <div className="bg-cream min-h-dvh pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="bg-white px-4 py-4 shadow-card">
        <h1 className="text-xl font-bold text-brown mb-2">{activity.title}</h1>
        <p className="text-sm text-brown-muted mb-4">{activity.description}</p>

        {signInStats && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-brown-muted">签到人数：</span>
              <span className="font-medium text-secondary-dark">{signInStats.signInCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-brown-muted">报名人数：</span>
              <span className="font-medium text-primary">{signInStats.registrationCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-0 bg-white z-10 border-b shadow-card px-4 py-2">
        <Tabs
          listOnly
          className="w-full"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as typeof activeTab)}
          items={[
            { key: 'qrcode', title: '签到二维码' },
            { key: 'signins', title: '签到记录' },
          ]}
        />
      </div>

      <div className="px-4 py-4">
        {activeTab === 'qrcode' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-base font-medium text-brown mb-4">活动签到二维码</h3>
              <QRCodeGenerator activityId={parseInt(activityId!)} />
            </Card>

            <Card>
              <h3 className="text-base font-medium text-brown mb-4">扫码签到</h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel>二维码内容</FieldLabel>
                  <Input
                    type="text"
                    value={scanQRCode}
                    onChange={(e) => setScanQRCode(e.target.value)}
                    placeholder="扫描二维码或输入二维码内容"
                  />
                </div>
                <div>
                  <FieldLabel>签到地点（可选）</FieldLabel>
                  <Input
                    type="text"
                    value={signInLocation}
                    onChange={(e) => setSignInLocation(e.target.value)}
                    placeholder="输入签到地点"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  block
                  disabled={isSigningIn}
                  loading={isSigningIn}
                  onClick={handleSignIn}
                >
                  确认签到
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'signins' && (
          <div>
            {signInList.length === 0 ? (
              <div className="py-8 text-center text-brown-muted">暂无签到记录</div>
            ) : (
              <div className="space-y-3">
                {signInList.map((record) => (
                  <Card key={record.id} padding="sm">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={record.userAvatar || getDefaultUserAvatar()}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-brown">{record.userNickname}</div>
                        <div className="text-xs text-brown-muted">{formatTime(record.signInTime)}</div>
                      </div>
                    </div>
                    {record.signInLocation && (
                      <div className="text-xs text-brown-muted mt-1 flex items-center gap-1">
                        <MapPin size={12} aria-hidden="true" />
                        <span>{record.signInLocation}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
