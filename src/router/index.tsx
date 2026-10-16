import type { ReactNode } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { AdminLayout, UserLayout, ProtectedRoute, AdminProtectedRoute } from '../components/layout';
import { DocumentTitleSync } from '../components/documentTitleSync';
import { lazyDefault, lazyNamed, PageSuspense } from './lazyPage';

// —— 社区前台（懒加载）——
const LoginPage = lazyNamed(() => import('../pages/auth/loginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('../pages/auth/registerPage'), 'RegisterPage');
const ResetPasswordPage = lazyNamed(
  () => import('../pages/auth/resetPasswordPage'),
  'ResetPasswordPage',
);
const UserProfilePage = lazyNamed(
  () => import('../pages/profile/userProfilePage'),
  'UserProfilePage',
);
const ProfileSettingsPage = lazyNamed(
  () => import('../pages/profile/profileSettingsPage'),
  'ProfileSettingsPage',
);
const PetListPage = lazyNamed(() => import('../pages/pet/petListPage'), 'PetListPage');
const PetFormPage = lazyNamed(() => import('../pages/pet/petFormPage'), 'PetFormPage');
const PetDetailPage = lazyNamed(() => import('../pages/pet/petDetailPage'), 'PetDetailPage');
const PostListPage = lazyNamed(() => import('../pages/post/postListPage'), 'PostListPage');
const PostDetailPage = lazyNamed(() => import('../pages/post/postDetailPage'), 'PostDetailPage');
const PostEditorPage = lazyNamed(() => import('../pages/post/postEditorPage'), 'PostEditorPage');
const DraftListPage = lazyNamed(() => import('../pages/post/draftListPage'), 'DraftListPage');
const TopicListPage = lazyNamed(() => import('../pages/topic/topicListPage'), 'TopicListPage');
const TopicDetailPage = lazyNamed(() => import('../pages/topic/topicDetailPage'), 'TopicDetailPage');
const TopicCreatePage = lazyNamed(() => import('../pages/topic/topicCreatePage'), 'TopicCreatePage');
const FollowListPage = lazyDefault(() => import('../pages/social/followListPage'));
const FollowIndexRedirect = lazyNamed(
  () => import('../pages/social/followListPage'),
  'FollowIndexRedirect',
);
const BlockedListPage = lazyDefault(() => import('../pages/social/blockedListPage'));
const MessageListPage = lazyDefault(() => import('../pages/social/messageListPage'));
const NewMessagePage = lazyDefault(() => import('../pages/social/newMessagePage'));
const ChatPage = lazyDefault(() => import('../pages/social/chatPage'));
const NotificationListPage = lazyDefault(() => import('../pages/social/notificationListPage'));
const NotificationSettingsPage = lazyDefault(
  () => import('../pages/social/notificationSettingsPage'),
);
const PointsPage = lazyDefault(() => import('../pages/social/pointsPage'));
const LostPetListPage = lazyNamed(
  () => import('../pages/pet/lostPetListPage'),
  'LostPetListPage',
);
const LostPetDetailPage = lazyNamed(
  () => import('../pages/pet/lostPetDetailPage'),
  'LostPetDetailPage',
);
const LostPetCreatePage = lazyNamed(
  () => import('../pages/pet/lostPetCreatePage'),
  'LostPetCreatePage',
);
const SearchPage = lazyNamed(() => import('../pages/discovery/searchPage'), 'SearchPage');
const TopicSquarePage = lazyNamed(
  () => import('../pages/discovery/topicSquarePage'),
  'TopicSquarePage',
);
const CategoryPage = lazyNamed(() => import('../pages/discovery/categoryPage'), 'CategoryPage');
const RankingPage = lazyNamed(() => import('../pages/discovery/rankingPage'), 'RankingPage');
const ActivityListPage = lazyNamed(
  () => import('../pages/activity/activityListPage'),
  'ActivityListPage',
);
const ActivityDetailPage = lazyNamed(
  () => import('../pages/activity/activityDetailPage'),
  'ActivityDetailPage',
);
const ActivitySignInPage = lazyNamed(
  () => import('../pages/activity/activitySignInPage'),
  'ActivitySignInPage',
);
const AdoptListPage = lazyNamed(() => import('../pages/adopt/adoptListPage'), 'AdoptListPage');
const AdoptDetailPage = lazyNamed(
  () => import('../pages/adopt/adoptDetailPage'),
  'AdoptDetailPage',
);
const AdoptCreatePage = lazyNamed(
  () => import('../pages/adopt/adoptCreatePage'),
  'AdoptCreatePage',
);

// —— 管理后台（懒加载，与社区分包隔离）——
const AdminLoginPage = lazyNamed(() => import('../pages/admin/adminLoginPage'), 'AdminLoginPage');
const AdminUserListPage = lazyNamed(
  () => import('../pages/admin/adminUserListPage'),
  'AdminUserListPage',
);
const AdminUserFormPage = lazyNamed(
  () => import('../pages/admin/adminUserFormPage'),
  'AdminUserFormPage',
);
const AdminDashboardPage = lazyNamed(
  () => import('../pages/admin/adminDashboardPage'),
  'AdminDashboardPage',
);
const AdminSettingsPage = lazyNamed(
  () => import('../pages/admin/adminSettingsPage'),
  'AdminSettingsPage',
);
const AdminSensitiveWordsPage = lazyNamed(
  () => import('../pages/admin/adminSensitiveWordsPage'),
  'AdminSensitiveWordsPage',
);
const AdminLogsPage = lazyNamed(() => import('../pages/admin/adminLogsPage'), 'AdminLogsPage');
const AdminFrontUserPage = lazyNamed(
  () => import('../pages/admin/adminFrontUserPage'),
  'AdminFrontUserPage',
);
const AdminReviewPage = lazyNamed(
  () => import('../pages/admin/adminReviewPage'),
  'AdminReviewPage',
);
const AdminReportPage = lazyNamed(
  () => import('../pages/admin/adminReportPage'),
  'AdminReportPage',
);
const AdminAnalyticsPage = lazyDefault(() => import('../pages/admin/analyticsPage'));
const ActivityVotePage = lazyNamed(
  () => import('../pages/admin/activityVotePage'),
  'ActivityVotePage',
);
const AdminAdPage = lazyNamed(() => import('../pages/admin/adminAdPage'), 'AdminAdPage');
const AdminNotificationPage = lazyNamed(
  () => import('../pages/admin/adminNotificationPage'),
  'AdminNotificationPage',
);
const AdminNotFoundPage = lazyNamed(
  () => import('../pages/admin/adminNotFoundPage'),
  'AdminNotFoundPage',
);
const NotFoundPage = lazyNamed(() => import('../pages/error/notFoundPage'), 'NotFoundPage');
const AdminActivityListPage = lazyNamed(
  () => import('../pages/admin/adminActivityListPage'),
  'AdminActivityListPage',
);
const ActivityCreatePage = lazyNamed(
  () => import('../pages/admin/activityCreatePage'),
  'ActivityCreatePage',
);
const ActivityEditPage = lazyNamed(
  () => import('../pages/admin/activityEditPage'),
  'ActivityEditPage',
);
const ActivityRegistrationsPage = lazyNamed(
  () => import('../pages/admin/activityRegistrationsPage'),
  'ActivityRegistrationsPage',
);

function withUser(page: ReactNode, protectedRoute = false) {
  const inner = (
    <UserLayout>
      <PageSuspense>{page}</PageSuspense>
    </UserLayout>
  );
  return protectedRoute ? <ProtectedRoute>{inner}</ProtectedRoute> : inner;
}

function withAdmin(page: ReactNode) {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <PageSuspense>{page}</PageSuspense>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

function bare(page: ReactNode, protectedRoute = false) {
  const inner = <PageSuspense>{page}</PageSuspense>;
  return protectedRoute ? <ProtectedRoute>{inner}</ProtectedRoute> : inner;
}

function RootShell() {
  return (
    <>
      <DocumentTitleSync />
      <Outlet />
    </>
  );
}

const appRoutes: RouteObject[] = [
  { path: '/login', element: bare(<LoginPage />) },
  { path: '/register', element: bare(<RegisterPage />) },
  { path: '/reset-password', element: bare(<ResetPasswordPage />) },

  { path: '/', element: withUser(<PostListPage />) },
  { path: '/profile', element: withUser(<UserProfilePage />, true) },
  { path: '/profile/:id', element: withUser(<UserProfilePage />) },
  { path: '/settings', element: withUser(<ProfileSettingsPage />, true) },

  { path: '/pets', element: withUser(<PetListPage />, true) },
  { path: '/pets/create', element: withUser(<PetFormPage />, true) },
  { path: '/pets/:id', element: withUser(<PetDetailPage />, true) },
  { path: '/pets/:id/edit', element: withUser(<PetFormPage />, true) },

  { path: '/posts', element: withUser(<PostListPage />) },
  { path: '/posts/create', element: withUser(<PostEditorPage />, true) },
  { path: '/posts/drafts', element: withUser(<DraftListPage />, true) },
  { path: '/posts/drafts/:draftId', element: withUser(<PostEditorPage />, true) },
  { path: '/posts/:id', element: withUser(<PostDetailPage />) },
  { path: '/posts/:id/edit', element: withUser(<PostEditorPage />, true) },

  { path: '/lost-pets', element: withUser(<LostPetListPage />) },
  { path: '/lost-pets/create', element: withUser(<LostPetCreatePage />, true) },
  { path: '/lost-pets/:id', element: withUser(<LostPetDetailPage />) },

  { path: '/topics', element: withUser(<TopicListPage />, true) },
  { path: '/topics/create', element: withUser(<TopicCreatePage />, true) },
  { path: '/topics/:id', element: withUser(<TopicDetailPage />, true) },

  { path: '/follow', element: withUser(<FollowIndexRedirect />, true) },
  { path: '/follow/:userId/:type', element: withUser(<FollowListPage />, true) },
  { path: '/blocked', element: withUser(<BlockedListPage />, true) },

  { path: '/messages', element: withUser(<MessageListPage />, true) },
  { path: '/messages/new', element: withUser(<NewMessagePage />, true) },
  {
    path: '/messages/:conversationId/:targetUserId',
    element: bare(<ChatPage />, true),
  },

  { path: '/notifications', element: withUser(<NotificationListPage />, true) },
  { path: '/notification-settings', element: withUser(<NotificationSettingsPage />, true) },
  { path: '/points', element: withUser(<PointsPage />, true) },

  { path: '/search', element: withUser(<SearchPage />) },
  { path: '/discover', element: withUser(<TopicSquarePage />) },
  { path: '/category/:id', element: withUser(<CategoryPage />) },
  { path: '/ranking', element: withUser(<RankingPage />) },

  { path: '/activities', element: withUser(<ActivityListPage />) },
  { path: '/activities/:id', element: withUser(<ActivityDetailPage />) },
  { path: '/activities/:id/sign-in', element: bare(<ActivitySignInPage />, true) },

  { path: '/adopts', element: withUser(<AdoptListPage />) },
  { path: '/adopts/:id', element: withUser(<AdoptDetailPage />) },
  { path: '/adopts/create', element: withUser(<AdoptCreatePage />, true) },

  { path: '/admin/login', element: bare(<AdminLoginPage />) },
  { path: '/admin/users', element: withAdmin(<AdminUserListPage />) },
  { path: '/admin/front-users', element: withAdmin(<AdminFrontUserPage />) },
  { path: '/admin/users/create', element: withAdmin(<AdminUserFormPage />) },
  { path: '/admin/users/edit/:id', element: withAdmin(<AdminUserFormPage />) },
  { path: '/admin/dashboard', element: withAdmin(<AdminDashboardPage />) },
  { path: '/admin/analytics', element: withAdmin(<AdminAnalyticsPage />) },
  { path: '/admin/settings', element: withAdmin(<AdminSettingsPage />) },
  { path: '/admin/sensitive-words', element: withAdmin(<AdminSensitiveWordsPage />) },
  { path: '/admin/logs', element: withAdmin(<AdminLogsPage />) },
  { path: '/admin/reviews', element: withAdmin(<AdminReviewPage />) },
  { path: '/admin/reports', element: withAdmin(<AdminReportPage />) },
  { path: '/admin/notifications', element: withAdmin(<AdminNotificationPage />) },
  { path: '/admin/activities', element: withAdmin(<AdminActivityListPage />) },
  { path: '/admin/activities/create', element: withAdmin(<ActivityCreatePage />) },
  { path: '/admin/activities/:id/edit', element: withAdmin(<ActivityEditPage />) },
  { path: '/admin/activities/:id/registrations', element: withAdmin(<ActivityRegistrationsPage />) },
  { path: '/admin/activities/:id/vote', element: withAdmin(<ActivityVotePage />) },
  { path: '/admin/ads', element: withAdmin(<AdminAdPage />) },

  // 未知后台路径（须在通配前台 * 之前）
  { path: '/admin/*', element: withAdmin(<AdminNotFoundPage />) },
  // 未知前台路径
  { path: '*', element: withUser(<NotFoundPage />) },
];

const routes: RouteObject[] = [
  {
    element: <RootShell />,
    children: appRoutes,
  },
];

export const router = createBrowserRouter(routes);
