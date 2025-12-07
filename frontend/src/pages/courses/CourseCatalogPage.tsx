import { useState, useEffect } from 'react';
import { courseService } from '../../services/course.service';
import type { Course, CourseFilters } from '../../types/course';
import { CourseCard } from '../../components/course/CourseCard';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
        <div className="min-h-screen p-16 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
                <p className="text-gray-600 mt-2">
                    Discover your next learning adventure from our curated collection
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch}>Search</Button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        All Levels
                    </Button>
                    <Button variant="outline" size="sm">Free</Button>
                    <Button variant="outline" size="sm">Paid</Button>
                    <Button variant="outline" size="sm">Beginner</Button>
                    <Button variant="outline" size="sm">Intermediate</Button>
                    <Button variant="outline" size="sm">Advanced</Button>
                </div>
            </div>

            {/* Results */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        {loading ? 'Loading...' : `${courses.length} courses found`}
                    </p>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
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
    );
};
