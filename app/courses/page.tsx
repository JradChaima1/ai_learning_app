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
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link
          href="/courses/create"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
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
                className="text-blue-600 hover:underline"
              >
                View all your courses
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
              <Link
                href="/courses/create"
                className="text-blue-600 hover:underline"
              >
                Create your first course
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold truncate flex-1">{course.title}</h2>
                  {isSearchMode && course.relevanceScore !== undefined && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                      {Math.round((1 - course.relevanceScore) * 100)}% match
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">Difficulty: {course.difficulty}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
                
                {isSearchMode && course.matchingContent && course.matchingContent.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-xs font-medium text-blue-800 mb-1">Matching content:</p>
                    {course.matchingContent.map((content, index) => (
                      <p key={index} className="text-xs text-blue-700 line-clamp-2 mb-1">
                        "{content.substring(0, 100)}..."
                      </p>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Created by you</span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}