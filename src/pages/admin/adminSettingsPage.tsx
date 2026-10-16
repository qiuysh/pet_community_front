import { useState, useEffect } from 'react';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { UpdateSiteConfigRequest, UpdateAuditConfigRequest } from '../../types/admin';
import { AdminInput, AdminLabel, AdminTextarea } from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminTabs } from '../../components/admin/adminTabs';
import { AdminSwitch } from '../../components/admin/adminSwitch';
import { AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminUi } from '../../styles/adminUi';
import { useAdminTabQuery } from '../../hooks/useAdminTabQuery';

type TabType = 'site' | 'audit';
const SETTINGS_TABS = ['site', 'audit'] as const;

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useAdminTabQuery<TabType>('site', SETTINGS_TABS);
  const [isSaving, setIsSaving] = useState(false);
  const [siteForm, setSiteForm] = useState<UpdateSiteConfigRequest>({
    siteName: '',
    siteLogo: '',
    siteDescription: '',
    siteICP: '',
  });
  const [auditForm, setAuditForm] = useState<UpdateAuditConfigRequest>({
    autoAuditEnabled: false,
    sensitiveFilterEnabled: false,
  });

  const {
    siteConfig,
    auditConfig,
    loading,
    error,
    fetchSiteConfig,
    handleUpdateSiteConfig,
    fetchAuditConfig,
    handleUpdateAuditConfig,
    setError,
  } = useAdminSettings();

  useEffect(() => {
    if (activeTab === 'site') {
      fetchSiteConfig();
    } else if (activeTab === 'audit') {
      fetchAuditConfig();
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (siteConfig) {
      setSiteForm({
        siteName: siteConfig.siteName || '',
        siteLogo: siteConfig.siteLogo || '',
        siteDescription: siteConfig.siteDescription || '',
        siteICP: siteConfig.siteICP || '',
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    if (auditConfig) {
      setAuditForm({
        autoAuditEnabled: auditConfig.autoAuditEnabled,
        sensitiveFilterEnabled: auditConfig.sensitiveFilterEnabled,
      });
    }
  }, [auditConfig]);

  const handleSiteSubmit = async () => {
    setIsSaving(true);
    const success = await handleUpdateSiteConfig(siteForm);
    setIsSaving(false);
    if (success) {
      setError('网站配置更新成功');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAuditSubmit = async () => {
    setIsSaving(true);
    const success = await handleUpdateAuditConfig(auditForm);
    setIsSaving(false);
    if (success) {
      setError('审核配置更新成功');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="站点配置"
        description="配置站点信息与内容审核规则"
        tabs={
          <AdminTabs
            aria-label="系统设置分区"
            items={[
              { key: 'site', label: '网站配置' },
              { key: 'audit', label: '审核配置' },
            ]}
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabType)}
          />
        }
      />

      {error && (
        <div
          className={`mb-6 mx-6 px-4 py-3 rounded-md text-sm ${
            error.includes('成功')
              ? 'bg-success/10 border border-success/20 text-success'
              : 'bg-error/10 border border-error/20 text-error'
          }`}
          role="status"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="px-6 py-6">
        {activeTab === 'site' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <AdminLabel htmlFor="site-name">网站名称</AdminLabel>
                <AdminInput
                  id="site-name"
                  name="siteName"
                  type="text"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                  placeholder="请输入网站名称…"
                  autoComplete="off"
                />
              </div>
              <div>
                <AdminLabel htmlFor="site-logo">网站LOGO URL</AdminLabel>
                <AdminInput
                  id="site-logo"
                  name="siteLogo"
                  type="url"
                  value={siteForm.siteLogo}
                  onChange={(e) => setSiteForm({ ...siteForm, siteLogo: e.target.value })}
                  placeholder="https://example.com/logo.png…"
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <AdminLabel htmlFor="site-description">网站描述</AdminLabel>
                <AdminTextarea
                  id="site-description"
                  name="siteDescription"
                  value={siteForm.siteDescription}
                  onChange={(e) => setSiteForm({ ...siteForm, siteDescription: e.target.value })}
                  rows={3}
                  placeholder="请输入网站描述…"
                />
              </div>
              <div>
                <AdminLabel htmlFor="site-icp">ICP备案号</AdminLabel>
                <AdminInput
                  id="site-icp"
                  name="siteICP"
                  type="text"
                  value={siteForm.siteICP}
                  onChange={(e) => setSiteForm({ ...siteForm, siteICP: e.target.value })}
                  placeholder="请输入ICP备案号…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={handleSiteSubmit}
                disabled={isSaving || loading}
                loading={isSaving}
              >
                {isSaving ? '保存中…' : '保存配置'}
              </AdminButton>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-soft rounded-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-brown">自动审核</h3>
                    <p className="text-sm text-brown-muted mt-1">开启后，用户发布的内容将自动通过审核</p>
                  </div>
                </div>
                <AdminSwitch
                  aria-label="自动审核"
                  checked={auditForm.autoAuditEnabled}
                  onChange={(autoAuditEnabled) => setAuditForm({ ...auditForm, autoAuditEnabled })}
                />
              </div>
            </div>

            <div className="bg-soft rounded-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-brown">敏感词过滤</h3>
                    <p className="text-sm text-brown-muted mt-1">开启后，用户发布的内容将进行敏感词过滤</p>
                  </div>
                </div>
                <AdminSwitch
                  aria-label="敏感词过滤"
                  checked={auditForm.sensitiveFilterEnabled}
                  onChange={(sensitiveFilterEnabled) => setAuditForm({ ...auditForm, sensitiveFilterEnabled })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={handleAuditSubmit}
                disabled={isSaving || loading}
                loading={isSaving}
              >
                {isSaving ? '保存中…' : '保存配置'}
              </AdminButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
