import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOTPPage } from './pages/auth/VerifyOTPPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CourseCatalogPage } from './pages/courses/CourseCatalogPage';
import { CourseDetailPage } from './pages/courses/CourseDetailPage';
import { CourseReviewsPage } from './pages/courses/CourseReviewsPage';
import { CourseInstructorsPage } from './pages/courses/CourseInstructorsPage';
import { CourseContentPage } from './pages/courses/CourseContentPage';
import { CourseAnnouncementsPage } from './pages/courses/CourseAnnouncementsPage';
import { CourseQAPage } from './pages/courses/CourseQAPage';
import { MyLearningPage } from './pages/student/MyLearningPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { StudentTestsPage } from './pages/student/StudentTestsPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { InstructorDashboardPage } from './pages/instructor/InstructorDashboardPage';
import { InstructorAttendancePage } from './pages/instructor/InstructorAttendancePage';
import { MyCoursesPage } from './pages/instructor/MyCoursesPage';
import { CreateCoursePage } from './pages/instructor/CreateCoursePage';
import { EditCoursePage } from './pages/instructor/EditCoursePage';
import { ManageResourcesPage } from './pages/instructor/ManageResourcesPage';
import { CourseAnalyticsPage } from './pages/instructor/CourseAnalyticsPage';
import { InstructorStudentsPage } from './pages/instructor/InstructorStudentsPage';
import { FeedbackPage } from './pages/instructor/FeedbackPage';
import { ProfilePage as InstructorProfilePage } from './pages/instructor/ProfilePage';
import { CommunityPage } from './pages/community/CommunityPage';
import { CommunityDetailPage } from './pages/community/CommunityDetailPage';

import { ClassroomListPage } from './pages/classroom/ClassroomListPage';
import { ClassroomDetailPage } from './pages/classroom/ClassroomDetailPage';
import { TakeTestPage } from './pages/test/TakeTestPage';
import { TestSubmissionsPage } from './pages/test/TestSubmissionsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminCourseManagementPage } from './pages/admin/AdminCourseManagementPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { AdminInstructorsPage } from './pages/admin/AdminInstructorsPage';
import { AdminInstructorDetailsPage } from './pages/admin/AdminInstructorDetailsPage';
import { AdminCourseAnalyticsPage } from './pages/admin/AdminCourseAnalyticsPage';
import { ChatbotPage } from './pages/chatbot/ChatbotPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { InstructorOverviewPage } from './pages/InstructorOverviewPage';
import { StudentsPage } from './pages/StudentsPage';
import { FeedbackPage as StudentFeedbackPage } from './pages/FeedbackPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AnnouncementManagementPage } from './pages/admin/AnnouncementManagementPage';
import { InstructorAnalyticsPage } from './pages/admin/InstructorAnalyticsPage';
import { InstructorAnalyticsPage as InstructorSelfAnalyticsPage } from './pages/instructor/InstructorAnalyticsPage';
import { InstructorProfileViewPage } from './pages/admin/InstructorProfileViewPage';
import { CourseMonitoringPage } from './pages/admin/CourseMonitoringPage';
import { CourseTrackingPage } from './pages/admin/CourseTrackingPage';
import { AdminCourseDetailViewPage } from './pages/admin/AdminCourseDetailViewPage';
import { AdminCreateCoursePage } from './pages/admin/AdminCreateCoursePage';
import { TestsManagementPage } from './pages/instructor/TestsManagementPage';
import { CreateTestPage } from './pages/instructor/CreateTestPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CatalogLayout } from './components/layout/CatalogLayout';
import { StudentCourseLayout } from './components/layout/StudentCourseLayout';
import { Toaster } from 'react-hot-toast';

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
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Course Catalog with Sidebar */}
        <Route element={<CatalogLayout />}>
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/instructors/:id" element={<InstructorOverviewPage />} />
        </Route>

        {/* Course Detail Routes with Sidebar */}
        <Route element={<StudentCourseLayout />}>
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/reviews" element={<CourseReviewsPage />} />
          <Route path="/courses/:id/instructors" element={<CourseInstructorsPage />} />
          <Route path="/courses/:id/content" element={<CourseContentPage />} />
          <Route path="/courses/:id/announcements" element={<CourseAnnouncementsPage />} />
          <Route path="/community/course/:id/qa" element={<CourseQAPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/tests" element={<StudentTestsPage />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/instructor/courses" element={<MyCoursesPage />} />
          <Route path="/instructor/courses/:id/view/*" element={<AdminCourseDetailViewPage />} />
          <Route path="/instructor/courses/create" element={<CreateCoursePage />} />
          <Route path="/instructor/courses/:id/edit" element={<EditCoursePage />} />
          <Route path="/instructor/courses/:courseId/subjects/:subjectId/resources" element={<ManageResourcesPage />} />
          <Route path="/instructor/courses/:id/analytics" element={<CourseAnalyticsPage />} />
          <Route path="/instructor/students" element={<InstructorStudentsPage />} />
          <Route path="/instructor/attendance" element={<InstructorAttendancePage />} />
          <Route path="/instructor/analytics" element={<InstructorSelfAnalyticsPage />} />
          <Route path="/instructor/performance" element={<InstructorSelfAnalyticsPage />} />
          <Route path="/instructor/progress" element={<InstructorStudentsPage />} />
          <Route path="/instructor/tests" element={<TestsManagementPage />} />
          <Route path="/instructor/tests/create" element={<CreateTestPage />} />
          <Route path="/instructor/feedback" element={<FeedbackPage />} />
          <Route path="/instructor/profile" element={<InstructorProfilePage />} />

          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/classrooms" element={<ClassroomListPage />} />
          <Route path="/classroom/:id" element={<ClassroomDetailPage />} />
          <Route path="/test/:id/take" element={<TakeTestPage />} />
          <Route path="/test/:id/submissions" element={<TestSubmissionsPage />} />
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
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/feedback" element={<StudentFeedbackPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Course Player (Standalone) */}
        <Route path="/my-learning/:id" element={<CoursePlayerPage />} />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
