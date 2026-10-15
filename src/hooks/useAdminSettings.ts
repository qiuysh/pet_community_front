import { useState, useCallback } from 'react';
import { useAsync } from '../hooks/useAsync';
import {
  getSiteConfig,
  updateSiteConfig,
  getAuditConfig,
  updateAuditConfig,
  getSensitiveWords,
  addSensitiveWord,
  updateSensitiveWord,
  deleteSensitiveWord,
  getOperationLogs,
  getActivityLogs,
} from '../api/admin';
import {
  SiteConfig,
  AuditConfig,
  SensitiveWord,
  AdminOperationLog,
  UserActivityLog,
  UpdateSiteConfigRequest,
  UpdateAuditConfigRequest,
  AddSensitiveWordRequest,
  UpdateSensitiveWordRequest,
} from '../types/admin';

export function useAdminSettings() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [auditConfig, setAuditConfig] = useState<AuditConfig | null>(null);
  const [sensitiveWords, setSensitiveWords] = useState<SensitiveWord[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [operationLogs, setOperationLogs] = useState<AdminOperationLog[]>([]);
  const [totalOperations, setTotalOperations] = useState(0);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { loading, run } = useAsync();

  const fetchSiteConfig = useCallback(async () => {
    await run(
      () => getSiteConfig(),
      (config) => { setSiteConfig(config); setError(null); },
      () => setError('获取网站配置失败'),
    );
  }, [run]);

  const handleUpdateSiteConfig = useCallback(async (config: UpdateSiteConfigRequest) => {
    let ok = false;
    await run(
      () => updateSiteConfig(config),
      () => { ok = true; },
      () => setError('更新网站配置失败'),
    );
    if (!ok) return false;
    await fetchSiteConfig();
    setError(null);
    return true;
  }, [run, fetchSiteConfig]);

  const fetchAuditConfig = useCallback(async () => {
    await run(
      () => getAuditConfig(),
      (config) => { setAuditConfig(config); setError(null); },
      () => setError('获取审核配置失败'),
    );
  }, [run]);

  const handleUpdateAuditConfig = useCallback(async (config: UpdateAuditConfigRequest) => {
    let ok = false;
    await run(
      () => updateAuditConfig(config),
      () => { ok = true; },
      () => setError('更新审核配置失败'),
    );
    if (!ok) return false;
    await fetchAuditConfig();
    setError(null);
    return true;
  }, [run, fetchAuditConfig]);

  const fetchSensitiveWords = useCallback(async (keyword?: string, page = 1, limit = 20) => {
    await run(
      () => getSensitiveWords(keyword, page, limit),
      ({ list, total }) => {
        setSensitiveWords(list);
        setTotalWords(total);
        setError(null);
      },
      () => setError('获取敏感词列表失败'),
    );
  }, [run]);

  const handleAddSensitiveWord = useCallback(async (word: AddSensitiveWordRequest) => {
    let ok = false;
    await run(
      () => addSensitiveWord(word),
      () => { ok = true; },
      () => setError('添加敏感词失败'),
    );
    if (!ok) return false;
    await fetchSensitiveWords();
    setError(null);
    return true;
  }, [run, fetchSensitiveWords]);

  const handleUpdateSensitiveWord = useCallback(async (id: number, word: UpdateSensitiveWordRequest) => {
    let ok = false;
    await run(
      () => updateSensitiveWord(id, word),
      () => { ok = true; },
      () => setError('更新敏感词失败'),
    );
    if (!ok) return false;
    await fetchSensitiveWords();
    setError(null);
    return true;
  }, [run, fetchSensitiveWords]);

  const handleDeleteSensitiveWord = useCallback(async (id: number) => {
    let ok = false;
    await run(
      () => deleteSensitiveWord(id),
      () => { ok = true; },
      () => setError('删除敏感词失败'),
    );
    if (!ok) return false;
    await fetchSensitiveWords();
    setError(null);
    return true;
  }, [run, fetchSensitiveWords]);

  const fetchOperationLogs = useCallback(async (params: {
    adminId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
  }) => {
    await run(
      () => getOperationLogs(params),
      ({ list, total }) => {
        setOperationLogs(list);
        setTotalOperations(total);
        setError(null);
      },
      () => setError('获取操作日志失败'),
    );
  }, [run]);

  const fetchActivityLogs = useCallback(async (params: {
    userId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
  }) => {
    await run(
      () => getActivityLogs(params),
      ({ list, total }) => {
        setActivityLogs(list);
        setTotalActivities(total);
        setError(null);
      },
      () => setError('获取行为日志失败'),
    );
  }, [run]);

  return {
    siteConfig,
    auditConfig,
    sensitiveWords,
    totalWords,
    operationLogs,
    totalOperations,
    activityLogs,
    totalActivities,
    loading,
    error,
    fetchSiteConfig,
    handleUpdateSiteConfig,
    fetchAuditConfig,
    handleUpdateAuditConfig,
    fetchSensitiveWords,
    handleAddSensitiveWord,
    handleUpdateSensitiveWord,
    handleDeleteSensitiveWord,
    fetchOperationLogs,
    fetchActivityLogs,
    setError,
  };
}
