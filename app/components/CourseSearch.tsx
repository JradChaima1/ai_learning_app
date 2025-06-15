'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

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

interface CourseSearchProps {
  onSearchResults: (courses: Course[]) => void;
  onClearSearch: () => void;
}

export default function CourseSearch({ onSearchResults, onClearSearch }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMethod, setSearchMethod] = useState<'vector' | 'simple'>('vector');
  const [lastSearchMethod, setLastSearchMethod] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onClearSearch();
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Always use the main search endpoint - it will handle fallback automatically
      const response = await fetch('/api/courses/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSearchResults(data.courses);
        setLastSearchMethod(data.method || 'unknown');
      } else {
        console.error('Search failed:', data.error);
        onSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    setLastSearchMethod('');
    onClearSearch();
  };

  const getSearchMethodLabel = (method: string) => {
    switch (method) {
      case 'vector':
        return 'AI-Powered Search';
      case 'simple':
        return 'Keyword Search';
      default:
        return 'Search';
    }
  };

  const getSearchMethodColor = (method: string) => {
    switch (method) {
      case 'vector':
        return 'bg-purple-100 text-purple-800';
      case 'simple':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your courses by topic, content, or concepts..."
            className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 md:px-6 md:py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {query && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <p>
              Search results for: <span className="font-medium">"{query}"</span>
            </p>
            {lastSearchMethod && (
              <span className={`text-xs px-2 py-1 rounded ${getSearchMethodColor(lastSearchMethod)}`}>
                {getSearchMethodLabel(lastSearchMethod)}
              </span>
            )}
            {lastSearchMethod === 'simple' && (
              <span className="text-xs text-orange-600">
                (AI search unavailable - using keyword search)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 