import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-purple-600">AILearning</h1>
            </div>
            <nav className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
              <Link href="/courses" className="px-3 py-1 md:px-4 md:py-2 bg-purple-100 text-purple-600 rounded-md text-sm md:text-base hover:bg-purple-200 transition-colors">
                Browse Courses
              </Link>
              <Link href="/auth/signin" className="text-gray-600 text-sm md:text-base hover:text-purple-600 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-md text-sm md:text-base hover:bg-purple-700 transition-colors">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn with
            <span className="text-purple-600"> AI-Powered</span>
            <br />
            Courses
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create personalized courses, take interactive quizzes, and master any topic with our intelligent learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-purple-600 text-white px-8 py-3 md:px-10 md:py-4 rounded-md hover:bg-purple-700 transition-colors text-lg font-semibold"
            >
              Start Learning Free
            </Link>
            <Link
              href="/courses"
              className="bg-white text-purple-600 px-8 py-3 md:px-10 md:py-4 rounded-md hover:bg-purple-50 transition-colors text-lg font-semibold border border-purple-200"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AILearning?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of education with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Generated Courses</h3>
              <p className="text-gray-600">
                Create comprehensive courses on any topic with our advanced AI that adapts to your learning style.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Search</h3>
              <p className="text-gray-600">
                Find exactly what you need with our semantic search that understands context and meaning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Quizzes</h3>
              <p className="text-gray-600">
                Test your knowledge with AI-generated quizzes and get instant feedback on your progress.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Voice Learning</h3>
              <p className="text-gray-600">
                Take quizzes via voice calls for a hands-free, interactive learning experience.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized Learning</h3>
              <p className="text-gray-600">
                Get content tailored to your skill level and learning preferences.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics and performance insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Course</h3>
              <p className="text-gray-600">
                Choose a topic and let our AI generate a comprehensive course tailored to your needs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Learn & Practice</h3>
              <p className="text-gray-600">
                Study the content and take interactive quizzes to reinforce your understanding.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Master & Excel</h3>
              <p className="text-gray-600">
                Track your progress and master any subject with our intelligent learning system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of learners who are already using AI to master new skills.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-purple-600 px-8 py-3 md:px-10 md:py-4 rounded-md hover:bg-purple-50 transition-colors text-lg font-semibold inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold text-purple-400">AILearning</h3>
              </div>
              <p className="text-gray-400">
                The future of education powered by artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/quizzes" className="hover:text-white transition-colors">Quizzes</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AILearning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
