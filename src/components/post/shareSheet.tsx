import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Link2, MessageCircle, Send } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs } from '../ui/tabs';

/**
 * 帖子分享面板
 *
 * 用法:
 *   <ShareSheet
 *     open={shareOpen}
 *     onClose={() => setShareOpen(false)}
 *     postUrl={shareUrl}
 *     postTitle={post.title}
 *     onShare={(platform) => handleShare(platform)}
 *   />
 */

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  postUrl: string;
  postTitle?: string;
  onShare?: (platform: string) => void;
}

type Platform = 'wechat' | 'weibo' | 'link' | 'qrcode';

const PLATFORMS: Array<{ key: Platform; label: string; icon: React.ReactNode; color: string }> = [
  {
    key: 'wechat',
    label: '微信',
    icon: <MessageCircle size={20} aria-hidden="true" />,
    color: 'bg-success',
  },
  {
    key: 'weibo',
    label: '微博',
    icon: <Send size={20} aria-hidden="true" />,
    color: 'bg-error',
  },
  {
    key: 'link',
    label: '复制链接',
    icon: <Link2 size={20} aria-hidden="true" />,
    color: 'bg-secondary',
  },
  {
    key: 'qrcode',
    label: '二维码',
    icon: <Copy size={20} aria-hidden="true" />,
    color: 'bg-info',
  },
];

export const ShareSheet: React.FC<ShareSheetProps> = ({
  open,
  onClose,
  postUrl,
  postTitle,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'platforms' | 'qrcode'>('platforms');

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setActiveTab('platforms');
    }
  }, [open]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = postUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      showSuccessToast('链接已复制到剪贴板');
      onShare?.('link');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('复制链接失败', e);
      showErrorToast('复制失败,请长按链接手动复制');
    }
  };

  const handlePlatform = (platform: Platform) => {
    if (platform === 'link') {
      handleCopyLink();
      return;
    }
    if (platform === 'qrcode') {
      setActiveTab('qrcode');
      onShare?.('qrcode');
      return;
    }
    if (platform === 'wechat') {
      showSuccessToast('请使用微信扫一扫二维码进行分享');
      setActiveTab('qrcode');
      onShare?.('wechat');
      return;
    }
    if (platform === 'weibo') {
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(
        postUrl,
      )}&title=${encodeURIComponent(postTitle ?? '')}`;
      window.open(weiboUrl, '_blank', 'noopener,noreferrer');
      onShare?.('weibo');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="分享"
      size="md"
      footer={null}
    >
      <Tabs
        listOnly
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as 'platforms' | 'qrcode')}
        items={[
          { key: 'platforms', title: '分享方式' },
          { key: 'qrcode', title: '二维码' },
        ]}
        className="mb-4"
      />

      {activeTab === 'platforms' ? (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PLATFORMS.map((p) => (
              <Button
                key={p.key}
                type="button"
                variant="ghost"
                onClick={() => handlePlatform(p.key)}
                className="flex flex-col items-center gap-2 py-2 h-auto rounded-md hover:bg-secondary/5"
              >
                <span
                  className={`w-12 h-12 rounded-full ${p.color} text-white flex items-center justify-center`}
                >
                  {p.icon}
                </span>
                <span className="text-xs text-brown-muted">{p.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 bg-bg-secondary rounded-md border border-border-light">
            <Link2 size={14} className="text-brown-muted shrink-0" aria-hidden="true" />
            <Input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 bg-transparent text-sm text-brown-muted border-0 shadow-none focus:ring-0 px-0"
              aria-label="分享链接"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              aria-label="复制链接"
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-2">
          <div className="bg-white p-3 rounded-md border border-border-light shadow-soft mb-3">
            <QRCodeSVG
              value={postUrl}
              size={180}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#2B2F33"
            />
          </div>
          <p className="text-xs text-brown-muted text-center">
            扫描二维码查看{postTitle ? `「${truncate(postTitle, 20)}」` : '此动态'}
          </p>
        </div>
      )}
    </Modal>
  );
};

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export default ShareSheet;
