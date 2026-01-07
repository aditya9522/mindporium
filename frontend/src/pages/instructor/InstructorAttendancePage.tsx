import { useState, useEffect, useMemo } from 'react';
import { Loader2, Clock, ChevronDown, Monitor, Globe, Search, BookOpen, GraduationCap, Copy } from 'lucide-react';
import { VoiceInput } from '../../components/common/VoiceInput';
import api from '../../lib/axios';
import { classroomService } from '../../services/classroom.service';
import { format } from 'date-fns';
import { PageLoader } from '../../components/common/PageLoader';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';

interface Classroom {
    id: number;
    title: string;
    subject?: {
        title: string;
        course?: {
            title: string;
        };
    };
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
    ip_address?: string;
    device_info?: string;
}

export const InstructorAttendancePage = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const activeClassroom = useMemo(() =>
        classrooms.find(c => c.id === Number(selectedClassId)),
        [classrooms, selectedClassId]
    );

    const filteredAttendance = useMemo(() => {
        if (!searchQuery) return attendance;
        const lowerQ = searchQuery.toLowerCase();
        return attendance.filter(r =>
            r.user?.full_name.toLowerCase().includes(lowerQ) ||
            r.user?.email.toLowerCase().includes(lowerQ)
        );
    }, [attendance, searchQuery]);

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
        return <PageLoader />;
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                        Classroom Attendance
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-2">
                        View and manage attendance records for your live sessions
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            className="appearance-none bg-white/80 backdrop-blur-md pl-6 pr-12 py-4 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md min-w-[280px]"
                        >
                            {classrooms.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.title}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Card */}
            {activeClassroom?.subject && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 shadow-2xl group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                        <BookOpen className="w-96 h-96 text-white blur-3xl" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">
                            <GraduationCap className="w-5 h-5" />
                            <span>Course Context</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                            {activeClassroom.subject.course?.title || 'General Course'}
                        </h2>
                        <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md px-5 py-2.5 border border-white/10">
                            <span className="text-indigo-200 font-medium">Subject:</span>
                            <span className="text-white font-bold tracking-wide">
                                {activeClassroom.subject.title}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex-1 w-full flex items-center gap-3 pl-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 py-3 outline-none text-gray-700 font-medium placeholder:text-gray-400 bg-transparent"
                    />
                </div>
                <div className="pr-2 w-full sm:w-auto">
                    <VoiceInput onTranscript={(text) => setSearchQuery(text)} />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined At</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tech Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loadingAttendance ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                                            <p className="text-gray-500 font-medium">Loading attendance records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Search className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-900 font-semibold text-lg mb-1">No records found</p>
                                            <p className="text-gray-500">{searchQuery ? 'Try adjusting your search terms' : 'No attendance recorded for this session yet'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((record) => (
                                    <tr key={record.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                {record.user?.photo ? (
                                                    <img src={getImageUrl(record.user.photo)} alt={record.user.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-2 ring-white shadow-sm">
                                                        {record.user?.full_name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{record.user?.full_name || 'Unknown User'}</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-gray-500 text-xs font-medium truncate">{record.user?.email || 'No email provided'}</div>
                                                        {record.user?.email && (
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(record.user?.email!);
                                                                    toast.success('Email copied');
                                                                }}
                                                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                                title="Copy Email"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium text-sm">
                                                    {format(new Date(record.joined_at), 'h:mm a')}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {format(new Date(record.joined_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${record.status === 'present'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-100/50'}`}>
                                                <span className={`w-2 h-2 rounded-full shadow-sm ${record.status === 'present' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {record.left_at ? (
                                                <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-lg w-fit text-sm font-semibold text-gray-600">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {Math.round((new Date(record.left_at).getTime() - new Date(record.joined_at).getTime()) / 60000)}m
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                    </span>
                                                    Live
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {record.device_info && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md w-fit" title={record.device_info}>
                                                        <Monitor className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="truncate max-w-[150px]">{record.device_info}</span>
                                                    </div>
                                                )}
                                                {record.ip_address && (
                                                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 pl-1">
                                                        <Globe className="w-3 h-3 opacity-50" />
                                                        {record.ip_address}
                                                    </div>
                                                )}
                                                {!record.device_info && !record.ip_address && (
                                                    <span className="text-gray-300 text-xs italic">No device data</span>
                                                )}
                                            </div>
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
