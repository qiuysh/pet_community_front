import { useCallback } from 'react';
import { useActivitySignIn } from '../../hooks/useActivitySignIn';
import { QRCodeGenerator } from '../../components/activity/qrCodeGenerator';
import { QrCodeScanner } from '../../components/activity/qrCodeScanner';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { MapPin } from 'lucide-react';
import { ICON_SIZE } from '../../styles/iconSize';
import { useToast } from '../../components/toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { FieldLabel, Input } from '../../components/ui/input';
import { Tabs } from '../../components/ui/tabs';

export const ActivitySignInPage = () => {
  const toast = useToast();
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

  const onScan = useCallback(
    (text: string) => {
      handleSignIn(text);
    },
    [handleSignIn],
  );

  const onScanError = useCallback(
    (message: string) => {
      toast.warning(message);
    },
    [toast],
  );

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
      <div className="bg-white page-shell py-4 shadow-card">
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
              <span className="font-medium text-primary-text">{signInStats.registrationCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-0 bg-white z-10 border-b shadow-card px-4 py-2">
        {/* 页签条背景通栏，内容仍走 page-shell，与下方正文列对齐 */}
        <div className="page-shell">
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
      </div>

      <div className="page-shell py-4">
        {activeTab === 'qrcode' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-base font-medium text-brown mb-4">活动签到二维码</h3>
              <QRCodeGenerator activityId={activityId} />
            </Card>

            <Card>
              <h3 className="text-base font-medium text-brown mb-1">摄像头扫码</h3>
              <p className="text-xs text-brown-muted mb-4">
                对准现场签到二维码，识别成功后自动提交。无摄像头时请用手输。
              </p>
              <QrCodeScanner onScan={onScan} onError={onScanError} disabled={isSigningIn} />
            </Card>

            <Card>
              <h3 className="text-base font-medium text-brown mb-1">输入签到码</h3>
              <p className="text-xs text-brown-muted mb-4">
                降级通道：可用系统相机扫码后粘贴，或手动输入签到码。
              </p>
              <div className="space-y-4">
                <div>
                  <FieldLabel htmlFor="signin-qr-code">签到码</FieldLabel>
                  <Input
                    id="signin-qr-code"
                    name="qrCode"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={scanQRCode}
                    onChange={(e) => setScanQRCode(e.target.value)}
                    placeholder="粘贴或输入签到码…"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="signin-location">签到地点（可选）</FieldLabel>
                  <Input
                    id="signin-location"
                    name="signInLocation"
                    type="text"
                    autoComplete="off"
                    value={signInLocation}
                    onChange={(e) => setSignInLocation(e.target.value)}
                    placeholder="输入签到地点…"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  block
                  disabled={isSigningIn}
                  loading={isSigningIn}
                  onClick={() => handleSignIn()}
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
              <EmptyState compact title="暂无签到记录" />
            ) : (
              <div className="space-y-3">
                {signInList.map((record) => (
                  <Card key={record.id} padding="sm">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        decoding="async"
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
                        <MapPin size={ICON_SIZE.inline} aria-hidden="true" />
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
