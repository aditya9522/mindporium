import { useState, useEffect } from 'react';
import { courseService } from '../../services/course.service';
import type { Course, CourseFilters } from '../../types/course';
import { CourseCard } from '../../components/course/CourseCard';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { VoiceInput } from '../../components/ui/VoiceInput';

export const CourseCatalogPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<CourseFilters>({
        skip: 0,
        limit: 12,
    });

    useEffect(() => {
        loadCourses();
    }, [filters]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourses(filters);
            setCourses(data);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setFilters({ ...filters, search: searchQuery, skip: 0 });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12">
                        <Grid className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Explore Courses</h1>
                        <p className="text-gray-300 text-lg font-medium leading-relaxed">
                            Discover your next learning adventure from our curated collection of premium courses.
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300 sticky top-20 z-20">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Search Bar */}
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 dark:text-gray-100 font-medium"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <VoiceInput
                                        onResult={(text) => {
                                            setSearchQuery(text);
                                            setFilters({ ...filters, search: text, skip: 0 });
                                        }}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSearch} className="h-full px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">Search</Button>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                            variant={!filters.level && !filters.category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilters({ ...filters, level: undefined, category: undefined, skip: 0 })}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            All
                        </Button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

                        <Button
                            variant={filters.category === 'free' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilters({ ...filters, category: filters.category === 'free' ? undefined : 'free', skip: 0 })}
                        >
                            Free
                        </Button>
                        <Button
                            variant={filters.category === 'paid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilters({ ...filters, category: filters.category === 'paid' ? undefined : 'paid', skip: 0 })}
                        >
                            Paid
                        </Button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

                        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                            <Button
                                key={level}
                                variant={filters.level === level ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilters({ ...filters, level: filters.level === level ? undefined : level, skip: 0 })}
                                className="capitalize"
                            >
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {loading ? 'Loading...' : `${courses.length} courses found`}
                        </p>
                    </div>

                    {/* Course Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-96 animate-pulse border border-gray-100 dark:border-gray-800" />
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                            <Search className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className={`grid ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                            } gap-6`}>
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Load More */}
                {courses.length >= (filters.limit || 12) && !loading && (
                    <div className="text-center">
                        <Button
                            variant="outline"
                            onClick={() => setFilters({ ...filters, skip: (filters.skip || 0) + (filters.limit || 12) })}
                        >
                            Load More Courses
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
