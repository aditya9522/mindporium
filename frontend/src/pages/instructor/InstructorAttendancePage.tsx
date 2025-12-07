import { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { classroomService } from '../../services/classroom.service';
import { format } from 'date-fns';

interface Classroom {
    id: number;
    title: string;
}

interface AttendanceRecord {
    id: number;
    joined_at: string;
    left_at?: string;
    status: string;
    user?: {
        full_name: string;
        email: string;
        photo?: string;
    };
    classroom_title?: string;
}

export const InstructorAttendancePage = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const data = await classroomService.getAllClassrooms();
                setClassrooms(data);
                if (data.length > 0) {
                    setSelectedClassId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load classrooms');
            } finally {
                setLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            loadAttendance(Number(selectedClassId));
        }
    }, [selectedClassId]);

    const loadAttendance = async (classId: number) => {
        setLoadingAttendance(true);
        try {
            const response = await api.get(`/attendance/classroom/${classId}`);
            setAttendance(response.data);
        } catch (error) {
            console.error('Failed to load attendance');
            setAttendance([]);
        } finally {
            setLoadingAttendance(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Classroom Attendance</h1>
                    <p className="text-gray-500 mt-1">View attendance records for your live sessions</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {classrooms.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.title}</option>
                        ))}
                    </select>
                    {/* <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Export CSV">
                        <Download className="w-5 h-5" />
                    </button> */}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Joined At</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingAttendance ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No attendance records found for this class.
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {record.user?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{record.user?.full_name || 'Unknown User'}</div>
                                                    <div className="text-gray-500 text-xs">{record.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {format(new Date(record.joined_at), 'MMM d, yyyy h:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {/* Duration calculation placeholder */}
                                            {record.left_at ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {Math.round((new Date(record.left_at).getTime() - new Date(record.joined_at).getTime()) / 60000)} mins
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
