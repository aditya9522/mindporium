import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { PublicSidebar } from './PublicSidebar';

export const CourseLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex flex-1">
                <PublicSidebar />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
