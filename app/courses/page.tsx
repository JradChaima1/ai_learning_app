'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CourseSearch from '@/app/components/CourseSearch';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  relevanceScore?: number;
  matchingContent?: string[];
  user: {
    name: string;
  };
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: Course[]) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchMode(false);
  };

  const displayCourses = isSearchMode ? searchResults : courses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-purple-600">AILearning</h1>
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <Link href="/dashboard" className="px-3 py-1 md:px-4 md:py-2 bg-purple-100 text-purple-600 rounded-md text-sm md:text-base">Dashboard</Link>
          <Link href="/courses" className="text-gray-600 text-sm md:text-base">Courses</Link>
          <Link href="/logout" className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
            Logout
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">My Courses</h2>
            <p className="text-gray-600">Ready to learn with AI-powered courses?</p>
          </div>
          <Link
            href="/courses/create"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-purple-700 transition-colors text-sm md:text-base"
          >
            Create New Course
          </Link>
        </div>

        <CourseSearch 
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
        />

        {displayCourses.length === 0 ? (
          <div className="text-center py-12">
            {isSearchMode ? (
              <div>
                <p className="text-gray-500 mb-4">No courses found matching your search.</p>
                <button
                  onClick={handleClearSearch}
                  className="text-purple-600 hover:underline"
                >
                  View all your courses
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
                <Link
                  href="/courses/create"
                  className="text-purple-600 hover:underline"
                >
                  Create your first course
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg md:text-xl font-semibold truncate flex-1">{course.title}</h3>
                  {isSearchMode && course.relevanceScore !== undefined && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                      {Math.round((1 - course.relevanceScore) * 100)}% match
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">Difficulty: {course.difficulty}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
                
                {isSearchMode && course.matchingContent && course.matchingContent.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-md">
                    <p className="text-xs font-medium text-purple-800 mb-1">Matching content:</p>
                    {course.matchingContent.map((content, index) => (
                      <p key={index} className="text-xs text-purple-700 line-clamp-2 mb-1">
                        "{content.substring(0, 100)}..."
                      </p>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Created by you</span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}