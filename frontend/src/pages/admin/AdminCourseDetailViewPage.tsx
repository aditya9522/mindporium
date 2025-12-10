import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import {
    Loader2, ArrowLeft, BookOpen, Users, FileText, TestTube,
    MessageSquare, Settings, Bell, Star, BarChart3, Activity,
    GraduationCap, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CourseOverviewTab } from './course-detail-tabs/CourseOverviewTab';
import { SubjectsTab } from './course-detail-tabs/SubjectsTab';
import { EnrolledStudentsTab } from './course-detail-tabs/EnrolledStudentsTab';
import { FeedbacksTab } from './course-detail-tabs/FeedbacksTab';
import { ClassroomsTab } from './course-detail-tabs/ClassroomsTab';
import { ResourcesTab } from './course-detail-tabs/ResourcesTab';
import { TestsTab } from './course-detail-tabs/TestsTab';
import { AnnouncementsTab } from './course-detail-tabs/AnnouncementsTab';
import { CommunityTab } from './course-detail-tabs/CommunityTab';
import { InstructorsTab } from './course-detail-tabs/InstructorsTab';
import { SettingsTab } from './course-detail-tabs/SettingsTab';

export const AdminCourseDetailViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState<any>(null);

    const basePath = location.pathname.startsWith('/instructor') ? '/instructor' : '/admin';

    useEffect(() => {
        if (id) {
            fetchCourseData(parseInt(id));
        }
    }, [id]);

    const fetchCourseData = async (courseId: number) => {
        try {
            const response = await api.get(`/dashboard/admin/course/${courseId}/overview`);
            setCourseData(response.data);
        } catch (error) {
            console.error('Failed to fetch course data:', error);
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const sidebarItems = [
        {
            path: `${basePath}/courses/${id}/view`,
            label: 'Overview',
            icon: BookOpen,
            exact: true
        },
        {
            path: `${basePath}/courses/${id}/view/subjects`,
            label: 'Subjects',
            icon: FolderOpen
        },
        {
            path: `${basePath}/courses/${id}/view/students`,
            label: 'Enrolled Students',
            icon: Users
        },
        {
            path: `${basePath}/courses/${id}/view/classrooms`,
            label: 'Classrooms',
            icon: GraduationCap
        },
        {
            path: `${basePath}/courses/${id}/view/resources`,
            label: 'Resources',
            icon: FileText
        },
        {
            path: `${basePath}/courses/${id}/view/tests`,
            label: 'Tests',
            icon: TestTube
        },
        {
            path: `${basePath}/courses/${id}/view/announcements`,
            label: 'Announcements',
            icon: Bell
        },
        {
            path: `${basePath}/courses/${id}/view/feedbacks`,
            label: 'Feedbacks',
            icon: Star
        },
        {
            path: `${basePath}/courses/${id}/view/community`,
            label: 'Community',
            icon: MessageSquare
        },
        {
            path: `${basePath}/courses/${id}/analytics`,
            label: 'Analytics',
            icon: BarChart3
        },
        {
            path: `${basePath}/courses/${id}/tracking`,
            label: 'Tracking',
            icon: Activity
        },
        {
            path: `${basePath}/courses/${id}/view/instructors`,
            label: 'Instructors',
            icon: Users
        },
        {
            path: `${basePath}/courses/${id}/view/settings`,
            label: 'Settings',
            icon: Settings
        },
    ];

    const isActive = (path: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600">Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate(`${basePath}/courses`)}
                        className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{courseData.course?.title}</h1>
                            <p className="text-indigo-100">{courseData.course?.description}</p>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                                    {courseData.course?.level}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                                    {courseData.course?.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${courseData.course?.is_published
                                    ? 'bg-green-500/90'
                                    : 'bg-yellow-500/90'
                                    }`}>
                                    {courseData.course?.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold">{courseData.statistics?.total_enrollments || 0}</div>
                            <div className="text-indigo-100">Students Enrolled</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Course Navigation</h2>
                            </div>
                            <nav className="p-2">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path, item.exact);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${active
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <Routes>
                            <Route index element={<CourseOverviewTab courseData={courseData} refreshData={() => fetchCourseData(parseInt(id!))} />} />
                            <Route path="subjects" element={<SubjectsTab courseData={courseData} />} />
                            <Route path="students" element={<EnrolledStudentsTab courseData={courseData} />} />
                            <Route path="feedbacks" element={<FeedbacksTab courseData={courseData} />} />
                            <Route path="classrooms" element={<ClassroomsTab courseData={courseData} />} />
                            <Route path="resources" element={<ResourcesTab courseData={courseData} />} />
                            <Route path="tests" element={<TestsTab courseData={courseData} />} />
                            <Route path="announcements" element={<AnnouncementsTab courseData={courseData} />} />
                            <Route path="community" element={<CommunityTab courseData={courseData} />} />
                            <Route path="instructors" element={<InstructorsTab courseData={courseData} refreshData={() => fetchCourseData(parseInt(id!))} />} />
                            <Route path="settings" element={<SettingsTab courseData={courseData} refreshData={() => fetchCourseData(parseInt(id!))} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};
