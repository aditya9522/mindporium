import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import { PageLoader } from '../../components/common/PageLoader';

interface Attendance {
    id: number;
    classroom_title: string;
    joined_at: string;
    is_present: boolean;
    status: string;
}

export const StudentAttendancePage = () => {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            const response = await api.get('/attendance/me');
            setAttendances(response.data);
        } catch (error) {
            console.error('Failed to load attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-600 tracking-tight mb-2">My Attendance</h1>
                    <p className="text-lg text-gray-500 font-medium">Track your presence and classroom engagement</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {attendances.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Records Found</h3>
                            <p>You haven't attended any tracked sessions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Classroom</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {attendances.map((record) => (
                                        <tr key={record.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {record.classroom_title || 'Untitled Classroom'}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                                    {new Date(record.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-purple-400" />
                                                    {new Date(record.joined_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                {record.is_present ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {record.status || 'Marked Absent'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
