import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { StudentCourseSidebar } from './StudentCourseSidebar';

export const StudentCourseLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar showSidebarToggle={true} />
            <div className="flex flex-1">
                <StudentCourseSidebar />
                <main className="flex-1 w-full overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
