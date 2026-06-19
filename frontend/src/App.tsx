import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts (Eagerly loaded for shell)
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CourseContextLayout } from './components/layout/CourseContextLayout';

// Common
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ThemeInitializer } from './components/common/ThemeInitializer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOTPPage } from './pages/auth/VerifyOTPPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from './pages/common/UnauthorizedPage';
import { lazy, Suspense } from 'react';
import { PageLoader } from './components/common/PageLoader';

const ProfilePage = lazy(() => import('./pages/common/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CourseCatalogPage = lazy(() => import('./pages/courses/CourseCatalogPage').then(m => ({ default: m.CourseCatalogPage })));
const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })));
const CourseReviewsPage = lazy(() => import('./pages/courses/CourseReviewsPage').then(m => ({ default: m.CourseReviewsPage })));
const CourseInstructorsPage = lazy(() => import('./pages/courses/CourseInstructorsPage').then(m => ({ default: m.CourseInstructorsPage })));
const CourseContentPage = lazy(() => import('./pages/courses/CourseContentPage').then(m => ({ default: m.CourseContentPage })));
const CourseAnnouncementsPage = lazy(() => import('./pages/courses/CourseAnnouncementsPage').then(m => ({ default: m.CourseAnnouncementsPage })));
const CourseQAPage = lazy(() => import('./pages/courses/CourseQAPage').then(m => ({ default: m.CourseQAPage })));
const MyLearningPage = lazy(() => import('./pages/student/MyLearningPage').then(m => ({ default: m.MyLearningPage })));
const CoursePlayerPage = lazy(() => import('./pages/student/CoursePlayerPage').then(m => ({ default: m.CoursePlayerPage })));
const StudentTestsPage = lazy(() => import('./pages/student/StudentTestsPage').then(m => ({ default: m.StudentTestsPage })));
const StudentAttendancePage = lazy(() => import('./pages/student/StudentAttendancePage').then(m => ({ default: m.StudentAttendancePage })));
const InstructorDashboardPage = lazy(() => import('./pages/instructor/InstructorDashboardPage').then(m => ({ default: m.InstructorDashboardPage })));
const InstructorAttendancePage = lazy(() => import('./pages/instructor/InstructorAttendancePage').then(m => ({ default: m.InstructorAttendancePage })));
const MyCoursesPage = lazy(() => import('./pages/instructor/MyCoursesPage').then(m => ({ default: m.MyCoursesPage })));
const CreateCoursePage = lazy(() => import('./pages/instructor/CreateCoursePage').then(m => ({ default: m.CreateCoursePage })));
const EditCoursePage = lazy(() => import('./pages/instructor/EditCoursePage').then(m => ({ default: m.EditCoursePage })));
const ManageResourcesPage = lazy(() => import('./pages/instructor/ManageResourcesPage').then(m => ({ default: m.ManageResourcesPage })));
const CourseAnalyticsPage = lazy(() => import('./pages/instructor/CourseAnalyticsPage').then(m => ({ default: m.CourseAnalyticsPage })));
const InstructorStudentsPage = lazy(() => import('./pages/instructor/InstructorStudentsPage').then(m => ({ default: m.InstructorStudentsPage })));
const FeedbackPage = lazy(() => import('./pages/instructor/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const InstructorProfilePage = lazy(() => import('./pages/instructor/ProfilePage').then(m => ({ default: m.ProfilePage })));
const StudentProfilePage = lazy(() => import('./pages/instructor/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const CommunityPage = lazy(() => import('./pages/community/CommunityPage').then(m => ({ default: m.CommunityPage })));
const CommunityDetailPage = lazy(() => import('./pages/community/CommunityDetailPage').then(m => ({ default: m.CommunityDetailPage })));
const NewsPage = lazy(() => import('./pages/common/NewsPage').then(m => ({ default: m.NewsPage })));
const ClassroomListPage = lazy(() => import('./pages/classroom/ClassroomListPage').then(m => ({ default: m.ClassroomListPage })));
const ClassroomDetailPage = lazy(() => import('./pages/classroom/ClassroomDetailPage').then(m => ({ default: m.ClassroomDetailPage })));
const TakeTestPage = lazy(() => import('./pages/test/TakeTestPage').then(m => ({ default: m.TakeTestPage })));
const TestSubmissionsPage = lazy(() => import('./pages/test/TestSubmissionsPage').then(m => ({ default: m.TestSubmissionsPage })));
const TestPreviewPage = lazy(() => import('./pages/instructor/TestPreviewPage').then(m => ({ default: m.TestPreviewPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const AdminCourseManagementPage = lazy(() => import('./pages/admin/AdminCourseManagementPage').then(m => ({ default: m.AdminCourseManagementPage })));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage').then(m => ({ default: m.SystemSettingsPage })));
const AdminInstructorsPage = lazy(() => import('./pages/admin/AdminInstructorsPage').then(m => ({ default: m.AdminInstructorsPage })));
const AdminInstructorDetailsPage = lazy(() => import('./pages/admin/AdminInstructorDetailsPage').then(m => ({ default: m.AdminInstructorDetailsPage })));
const AdminCourseAnalyticsPage = lazy(() => import('./pages/admin/AdminCourseAnalyticsPage').then(m => ({ default: m.AdminCourseAnalyticsPage })));
const ChatbotPage = lazy(() => import('./pages/chatbot/ChatbotPage').then(m => ({ default: m.ChatbotPage })));
const InstructorsPage = lazy(() => import('./pages/public/InstructorsPage').then(m => ({ default: m.InstructorsPage })));
const InstructorOverviewPage = lazy(() => import('./pages/public/InstructorOverviewPage').then(m => ({ default: m.InstructorOverviewPage })));
const PublicPortfolioPage = lazy(() => import('./pages/public/PublicPortfolioPage').then(m => ({ default: m.PublicPortfolioPage })));
const StudentsPage = lazy(() => import('./pages/admin/StudentsPage').then(m => ({ default: m.StudentsPage })));
const StudentFeedbackPage = lazy(() => import('./pages/common/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage').then(m => ({ default: m.AdminFeedbackPage })));
const AnnouncementManagementPage = lazy(() => import('./pages/admin/AnnouncementManagementPage').then(m => ({ default: m.AnnouncementManagementPage })));
const InstructorAnalyticsPage = lazy(() => import('./pages/admin/InstructorAnalyticsPage').then(m => ({ default: m.InstructorAnalyticsPage })));
const InstructorSelfAnalyticsPage = lazy(() => import('./pages/instructor/InstructorAnalyticsPage').then(m => ({ default: m.InstructorAnalyticsPage })));
const InstructorProfileViewPage = lazy(() => import('./pages/admin/InstructorProfileViewPage').then(m => ({ default: m.InstructorProfileViewPage })));
const CourseMonitoringPage = lazy(() => import('./pages/admin/CourseMonitoringPage').then(m => ({ default: m.CourseMonitoringPage })));
const CourseTrackingPage = lazy(() => import('./pages/admin/CourseTrackingPage').then(m => ({ default: m.CourseTrackingPage })));
const AdminCourseDetailViewPage = lazy(() => import('./pages/admin/AdminCourseDetailViewPage').then(m => ({ default: m.AdminCourseDetailViewPage })));
const AdminCreateCoursePage = lazy(() => import('./pages/admin/AdminCreateCoursePage').then(m => ({ default: m.AdminCreateCoursePage })));
const TestsManagementPage = lazy(() => import('./pages/instructor/TestsManagementPage').then(m => ({ default: m.TestsManagementPage })));
const CreateTestPage = lazy(() => import('./pages/instructor/CreateTestPage').then(m => ({ default: m.CreateTestPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const CareerWorkspacePage = lazy(() => import('./pages/student/career-tools/CareerWorkspacePage').then(m => ({ default: m.CareerWorkspacePage })));

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ErrorBoundary>
        <ThemeInitializer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />
          </Route>


          {/* Dashboard Layout Routes (Unified) */}
          <Route element={<DashboardLayout />}>
            {/* Course Catalog */}
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/instructors/:id" element={<InstructorOverviewPage />} />

            {/* Course Detail Routes (with context sidebar) */}
            <Route element={<CourseContextLayout />}>
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses/:id/reviews" element={<CourseReviewsPage />} />
              <Route path="/courses/:id/instructors" element={<CourseInstructorsPage />} />
              <Route path="/courses/:id/content" element={<CourseContentPage />} />
              <Route path="/courses/:id/announcements" element={<CourseAnnouncementsPage />} />
              <Route path="/community/course/:id/qa" element={<CourseQAPage />} />
            </Route>


            {/* General Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:id" element={<CommunityDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/classrooms" element={<ClassroomListPage />} />
              <Route path="/classroom/:id" element={<ClassroomDetailPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/feedback" element={<StudentFeedbackPage />} />
            </Route>

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute requiredRole={['student']} />}>
              <Route path="/my-learning" element={<MyLearningPage />} />
              <Route path="/student/attendance" element={<StudentAttendancePage />} />
              <Route path="/tests" element={<StudentTestsPage />} />
              <Route path="/test/:id/take" element={<TakeTestPage />} />
              <Route path="/career" element={<Navigate to="/career/job-search" replace />} />
              <Route path="/career/:tab" element={<CareerWorkspacePage />} />
              <Route path="/resume-builder" element={<Navigate to="/career/resume-builder" replace />} />
            </Route>

            {/* Instructor Protected Routes */}
            <Route element={<ProtectedRoute requiredRole={['instructor', 'admin']} />}>
              <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
              <Route path="/instructor/courses" element={<MyCoursesPage />} />
              <Route path="/instructor/courses/:id/view/*" element={<AdminCourseDetailViewPage />} />
              <Route path="/instructor/courses/create" element={<CreateCoursePage />} />
              <Route path="/instructor/courses/:id/edit" element={<EditCoursePage />} />
              <Route path="/instructor/courses/:courseId/subjects/:subjectId/resources" element={<ManageResourcesPage />} />
              <Route path="/instructor/courses/:id/analytics" element={<CourseAnalyticsPage />} />
              <Route path="/instructor/students" element={<InstructorStudentsPage />} />
              <Route path="/instructor/students/:id" element={<StudentProfilePage />} />
              <Route path="/instructor/attendance" element={<InstructorAttendancePage />} />
              <Route path="/instructor/analytics" element={<InstructorSelfAnalyticsPage />} />
              <Route path="/instructor/performance" element={<InstructorSelfAnalyticsPage />} />
              <Route path="/instructor/progress" element={<InstructorStudentsPage />} />
              <Route path="/instructor/tests" element={<TestsManagementPage />} />
              <Route path="/instructor/tests/create" element={<CreateTestPage />} />
              <Route path="/instructor/tests/:id/edit" element={<CreateTestPage />} />
              <Route path="/instructor/tests/:id/preview" element={<TestPreviewPage />} />
              <Route path="/test/:id/submissions" element={<TestSubmissionsPage />} />
              <Route path="/instructor/feedback" element={<FeedbackPage />} />
              <Route path="/instructor/profile" element={<InstructorProfilePage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute requiredRole={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
              <Route path="/admin/courses/create" element={<AdminCreateCoursePage />} />
              <Route path="/admin/announcements" element={<AnnouncementManagementPage />} />
              <Route path="/admin/system" element={<SystemSettingsPage />} />
              <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
              <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
              <Route path="/admin/instructors/:id" element={<AdminInstructorDetailsPage />} />
              <Route path="/admin/instructors/:id/analytics" element={<InstructorAnalyticsPage />} />
              <Route path="/admin/instructors/:id/profile" element={<InstructorProfileViewPage />} />
              <Route path="/admin/courses/:id/analytics" element={<AdminCourseAnalyticsPage />} />
              <Route path="/admin/courses/:id/view/*" element={<AdminCourseDetailViewPage />} />
              <Route path="/admin/courses/:id/monitoring" element={<CourseMonitoringPage />} />
              <Route path="/admin/courses/:id/tracking" element={<CourseTrackingPage />} />
              <Route path="/students" element={<StudentsPage />} />
            </Route>
          </Route>

          {/* Course Player (Standalone) */}
          <Route element={<ProtectedRoute requiredRole={['student']} />}>
            <Route path="/my-learning/:id" element={<CoursePlayerPage />} />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;