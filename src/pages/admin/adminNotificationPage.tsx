import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  deleteNotification, 
  sendNotification,
  getAnnouncements,
  deleteAnnouncement,
  updateAnnouncementStatus,
  pinAnnouncement
} from '../../api/admin';
import type { SystemNotification, Announcement } from '../../types/admin';
import { NotificationForm, NotificationPreview } from '../../components/admin/notificationForm';
import { AnnouncementForm } from '../../components/admin/announcementForm';
import { Pagination } from '../../components/admin/pagination';
import { showSuccessToast, showErrorToast } from '../../utils/toastManager';
import { Pin } from 'lucide-react';
import { ICON_SIZE } from '../../styles/iconSize';
import { AdminSelect } from '../../components/admin/adminField';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminTabs } from '../../components/admin/adminTabs';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminActionClass, adminUi } from '../../styles/adminUi';
import { useAdminTabQuery } from '../../hooks/useAdminTabQuery';
import { useSyncedSearchParams } from '../../hooks/useSyncedSearchParams';
import { useConfirm } from '../../hooks/useConfirm';

type TabType = 'notification' | 'announcement';
const NOTIFICATION_TABS = ['notification', 'announcement'] as const;

const NOTIFY_ADMIN_QUERY = {
  page: { kind: 'number', default: 1 },
  type: { kind: 'string', default: '0' },
  status: { kind: 'string', default: '-1' },
} as const;

const PAGE_SIZE = 20;

const notificationTypes = [
  { value: 0, label: '全部类型' },
  { value: 1, label: '系统通知' },
  { value: 2, label: '公告' },
  { value: 3, label: '维护通知' },
];

const notificationStatus = [
  { value: -1, label: '全部状态' },
  { value: 0, label: '草稿' },
  { value: 1, label: '已发送' },
];

const announcementTypes = [
  { value: 0, label: '全部类型' },
  { value: 1, label: '系统公告' },
  { value: 2, label: '活动公告' },
  { value: 3, label: '维护公告' },
];

const announcementStatus = [
  { value: -1, label: '全部状态' },
  { value: 0, label: '已关闭' },
  { value: 1, label: '发布中' },
];

const targetTypes = [
  { value: 0, label: '全部用户' },
  { value: 1, label: '指定用户组' },
  { value: 2, label: '特定用户' },
];

export function AdminNotificationPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [activeTab, setActiveTab] = useAdminTabQuery<TabType>('notification', NOTIFICATION_TABS);
  const [query, setQuery] = useSyncedSearchParams(NOTIFY_ADMIN_QUERY, {
    resetPageOn: ['type', 'status'],
  });
  const currentPage = query.page;
  const typeFilter = Number(query.type);
  const statusFilter = Number(query.status);

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementTotal, setAnnouncementTotal] = useState(0);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<SystemNotification | null>(null);
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<SystemNotification | null>(null);

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const result = await getNotifications({
        type: typeFilter || undefined,
        status: statusFilter >= 0 ? statusFilter : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setNotifications(result.list);
      setNotificationTotal(result.total);
    } catch (err) {
      showErrorToast('获取通知列表失败');
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [typeFilter, statusFilter, currentPage]);

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    try {
      const result = await getAnnouncements({
        type: typeFilter || undefined,
        status: statusFilter >= 0 ? statusFilter : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setAnnouncements(result.list);
      setAnnouncementTotal(result.total);
    } catch (err) {
      showErrorToast('获取公告列表失败');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [typeFilter, statusFilter, currentPage]);

  useEffect(() => {
    if (activeTab === 'notification') {
      loadNotifications();
    } else {
      loadAnnouncements();
    }
  }, [activeTab, loadNotifications, loadAnnouncements]);

  const handleDeleteNotification = async (id: number) => {
    const ok = await confirm({
      title: '删除通知？',
      description: '删除后不可恢复。',
      confirmText: '删除',
    });
    if (!ok) return;
    try {
      await deleteNotification(id);
      showSuccessToast('删除成功');
      loadNotifications();
    } catch (err) {
      showErrorToast('删除失败');
    }
  };

  const handleSendNotification = async (id: number) => {
    try {
      await sendNotification(id);
      showSuccessToast('发送成功');
      loadNotifications();
    } catch (err) {
      showErrorToast('发送失败');
    }
  };

  const handleEditNotification = (notification: SystemNotification) => {
    setEditingNotification(notification);
    setShowNotificationForm(true);
  };

  const handlePreviewNotification = (notification: SystemNotification) => {
    setPreviewNotification(notification);
    setShowNotificationPreview(true);
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const ok = await confirm({
      title: '删除公告？',
      description: '删除后不可恢复。',
      confirmText: '删除',
    });
    if (!ok) return;
    try {
      await deleteAnnouncement(id);
      showSuccessToast('删除成功');
      loadAnnouncements();
    } catch (err) {
      showErrorToast('删除失败');
    }
  };

  const handleToggleAnnouncementStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await updateAnnouncementStatus(id, { status: newStatus as 0 | 1 });
      showSuccessToast(newStatus === 1 ? '已发布' : '已关闭');
      loadAnnouncements();
    } catch (err) {
      showErrorToast('操作失败');
    }
  };

  const handlePinAnnouncement = async (id: number) => {
    try {
      await pinAnnouncement(id);
      showSuccessToast('置顶成功');
      loadAnnouncements();
    } catch (err) {
      showErrorToast('置顶失败');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getNotificationTypeLabel = (type: number) => {
    return notificationTypes.find(t => t.value === type)?.label || '未知';
  };

  const getNotificationStatusLabel = (status: number) => {
    return notificationStatus.find(s => s.value === status)?.label || '未知';
  };

  const getTargetTypeLabel = (targetType: number) => {
    return targetTypes.find(t => t.value === targetType)?.label || '未知';
  };

  const getAnnouncementTypeLabel = (type: number) => {
    return announcementTypes.find(t => t.value === type)?.label || '未知';
  };

  const getAnnouncementStatusLabel = (status: number) => {
    return announcementStatus.find(s => s.value === status)?.label || '未知';
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="通知公告"
        description="发布系统通知与站点公告"
        tabs={
          <AdminTabs
            aria-label="通知公告分区"
            items={[
              { key: 'notification', label: '系统通知' },
              { key: 'announcement', label: '公告' },
            ]}
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabType)}
          />
        }
        actions={
          activeTab === 'notification' && !showNotificationForm ? (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingNotification(null);
                setShowNotificationForm(true);
              }}
            >
              发布通知
            </AdminButton>
          ) : activeTab === 'announcement' && !showAnnouncementForm ? (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingAnnouncement(null);
                setShowAnnouncementForm(true);
              }}
            >
              发布公告
            </AdminButton>
          ) : undefined
        }
      />

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          {activeTab === 'notification' ? (
            <>
              <AdminFilterField label="通知类型" htmlFor="notification-type">
                <AdminSelect
                  id="notification-type"
                  name="notificationType"
                  value={typeFilter}
                  onChange={(e) => setQuery({ type: e.target.value })}
                >
                  {notificationTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminFilterField>
              <AdminFilterField label="通知状态" htmlFor="notification-status">
                <AdminSelect
                  id="notification-status"
                  name="notificationStatus"
                  value={statusFilter}
                  onChange={(e) => setQuery({ status: e.target.value })}
                >
                  {notificationStatus.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminFilterField>
            </>
          ) : (
            <>
              <AdminFilterField label="公告类型" htmlFor="announcement-type">
                <AdminSelect
                  id="announcement-type"
                  name="announcementType"
                  value={typeFilter}
                  onChange={(e) => setQuery({ type: e.target.value })}
                >
                  {announcementTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminFilterField>
              <AdminFilterField label="公告状态" htmlFor="announcement-status">
                <AdminSelect
                  id="announcement-status"
                  name="announcementStatus"
                  value={statusFilter}
                  onChange={(e) => setQuery({ status: e.target.value })}
                >
                  {announcementStatus.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminFilterField>
            </>
          )}
        </AdminFilterBar>
      </div>

      {activeTab === 'notification' && (
        <>
          <div className="px-6 overflow-x-auto">
            {isLoadingNotifications ? (
              <AdminTable.Status>加载中…</AdminTable.Status>
            ) : notifications.length === 0 ? (
              <AdminTable.Status>暂无通知</AdminTable.Status>
            ) : (
              <AdminTable aria-label="系统通知列表">
                <AdminTable.Header>
                  <AdminTable.Column isRowHeader>ID</AdminTable.Column>
                  <AdminTable.Column>标题</AdminTable.Column>
                  <AdminTable.Column>类型</AdminTable.Column>
                  <AdminTable.Column>发送对象</AdminTable.Column>
                  <AdminTable.Column>状态</AdminTable.Column>
                  <AdminTable.Column>定时时间</AdminTable.Column>
                  <AdminTable.Column>创建时间</AdminTable.Column>
                  <AdminTable.Column>操作</AdminTable.Column>
                </AdminTable.Header>
                <AdminTable.Body>
                  {notifications.map((notification) => (
                    <AdminTable.Row key={notification.id} id={String(notification.id)}>
                      <AdminTable.Cell className="whitespace-nowrap">{notification.id}</AdminTable.Cell>
                      <AdminTable.Cell>
                        <div className="max-w-xs truncate">{notification.title}</div>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 3 ? 'bg-warning/10 text-warning-text' : 'bg-secondary-soft text-secondary'
                        }`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        {getTargetTypeLabel(notification.targetType)}
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === 1 ? 'bg-success/10 text-success-text' : 'bg-warning/10 text-warning-text'
                        }`}>
                          {getNotificationStatusLabel(notification.status)}
                        </span>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        {formatDateTime(notification.publishAt)}
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        {formatDateTime(notification.createdAt)}
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <div className={adminUi.actions}>
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handlePreviewNotification(notification)}
                            className={adminActionClass('neutral')}
                          >
                            预览
                          </AdminButton>
                          {notification.status === 0 && (
                            <AdminButton
                              type="button"
                              variant="ghost"
                              onClick={() => handleSendNotification(notification.id)}
                              className={adminActionClass('success')}
                            >
                              发送
                            </AdminButton>
                          )}
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handleEditNotification(notification)}
                            className={adminActionClass('primary')}
                          >
                            编辑
                          </AdminButton>
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className={adminActionClass('danger')}
                          >
                            删除
                          </AdminButton>
                        </div>
                      </AdminTable.Cell>
                    </AdminTable.Row>
                  ))}
                </AdminTable.Body>
              </AdminTable>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            total={notificationTotal}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setQuery({ page })}
          />
        </>
      )}

      {activeTab === 'announcement' && (
        <>
          <div className="px-6 overflow-x-auto">
            {isLoadingAnnouncements ? (
              <AdminTable.Status>加载中…</AdminTable.Status>
            ) : announcements.length === 0 ? (
              <AdminTable.Status>暂无公告</AdminTable.Status>
            ) : (
              <AdminTable aria-label="公告列表">
                <AdminTable.Header>
                  <AdminTable.Column isRowHeader>ID</AdminTable.Column>
                  <AdminTable.Column>标题</AdminTable.Column>
                  <AdminTable.Column>类型</AdminTable.Column>
                  <AdminTable.Column>状态</AdminTable.Column>
                  <AdminTable.Column>排序</AdminTable.Column>
                  <AdminTable.Column>时间范围</AdminTable.Column>
                  <AdminTable.Column>创建时间</AdminTable.Column>
                  <AdminTable.Column>操作</AdminTable.Column>
                </AdminTable.Header>
                <AdminTable.Body>
                  {announcements.map((announcement) => (
                    <AdminTable.Row key={announcement.id} id={String(announcement.id)}>
                      <AdminTable.Cell className="whitespace-nowrap">{announcement.id}</AdminTable.Cell>
                      <AdminTable.Cell>
                        <div className="max-w-xs truncate">
                          {announcement.sortOrder > 0 && (
                            <span className="text-secondary mr-1 inline-flex items-center"><Pin size={ICON_SIZE.inline} aria-hidden="true" /></span>
                          )}
                          {announcement.title}
                        </div>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.type === 3 ? 'bg-warning/10 text-warning-text' : 'bg-secondary-soft text-secondary'
                        }`}>
                          {getAnnouncementTypeLabel(announcement.type)}
                        </span>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.status === 1 ? 'bg-success/10 text-success-text' : 'bg-muted text-brown-muted'
                        }`}>
                          {getAnnouncementStatusLabel(announcement.status)}
                        </span>
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">{announcement.sortOrder}</AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        {formatDateTime(announcement.startAt)} - {formatDateTime(announcement.endAt)}
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        {formatDateTime(announcement.createdAt)}
                      </AdminTable.Cell>
                      <AdminTable.Cell className="whitespace-nowrap">
                        <div className={adminUi.actions}>
                          {announcement.status === 1 && (
                            <AdminButton
                              type="button"
                              variant="ghost"
                              onClick={() => handlePinAnnouncement(announcement.id)}
                              className={adminActionClass('warning')}
                            >
                              置顶
                            </AdminButton>
                          )}
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handleToggleAnnouncementStatus(announcement.id, announcement.status)}
                            className={adminActionClass(announcement.status === 1 ? 'warning' : 'success')}
                          >
                            {announcement.status === 1 ? '关闭' : '发布'}
                          </AdminButton>
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handleEditAnnouncement(announcement)}
                            className={adminActionClass('primary')}
                          >
                            编辑
                          </AdminButton>
                          <AdminButton
                            type="button"
                            variant="ghost"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className={adminActionClass('danger')}
                          >
                            删除
                          </AdminButton>
                        </div>
                      </AdminTable.Cell>
                    </AdminTable.Row>
                  ))}
                </AdminTable.Body>
              </AdminTable>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            total={announcementTotal}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setQuery({ page })}
          />
        </>
      )}

      {showNotificationForm && (
        <NotificationForm
          notification={editingNotification}
          onClose={() => {
            setShowNotificationForm(false);
            setEditingNotification(null);
          }}
          onSuccess={loadNotifications}
        />
      )}

      {showNotificationPreview && previewNotification && (
        <NotificationPreview
          title={previewNotification.title}
          content={previewNotification.content}
          type={previewNotification.type}
          onClose={() => setShowNotificationPreview(false)}
        />
      )}

      {showAnnouncementForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onClose={() => {
            setShowAnnouncementForm(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={loadAnnouncements}
        />
      )}
      {confirmDialog}
    </div>
  );
}