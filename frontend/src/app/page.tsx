import Link from 'next/link';
import { ArrowRight, Mic, BookOpen, Users, Zap, Star, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ESL Speak
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Conversation Practice
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              Master English
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Through Conversation
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Practice English with AI tutors in realistic scenarios. Get instant pronunciation feedback, 
              personalized learning paths, and expert human review when you need it.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/scenarios"
                className="text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                Browse Scenarios
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { value: '8+', label: 'Real-life Scenarios' },
                { value: '6', label: 'CEFR Levels' },
                { value: 'ZPD', label: 'Adaptive Learning' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Speak Confidently
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our AI-powered platform combines the best teaching methodologies with cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: 'Voice Recognition & Feedback',
                description: 'Practice speaking with real-time transcription and phoneme-level pronunciation analysis.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: 'Scenario-Based Learning',
                description: 'Learn English through realistic situations: restaurants, interviews, airports, and more.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Adaptive ZPD Technology',
                description: 'Our AI adjusts difficulty based on your performance, keeping you in the optimal learning zone.',
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Human-in-the-Loop',
                description: 'Get expert human feedback on your conversations when you need personalized guidance.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Progress Tracking',
                description: 'Track your improvement over time with detailed statistics and mastery levels.',
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Vocabulary in Context',
                description: 'Learn new words naturally within each scenario, with phonetic guides and examples.',
                color: 'from-indigo-500 to-blue-500',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Start practicing in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Your Scenario',
                description: 'Select from 8+ realistic conversation scenarios matched to your level and interests.',
              },
              {
                step: '02',
                title: 'Practice with AI Tutor',
                description: 'Have natural conversations with our AI tutor who adapts to your learning needs in real-time.',
              },
              {
                step: '03',
                title: 'Get Feedback & Improve',
                description: 'Receive pronunciation analysis, vocabulary hints, and optional human review to accelerate progress.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Speaking English?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of learners improving their English conversation skills every day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-transparent bg-clip-text font-bold text-lg px-8 py-4 rounded-2xl hover:shadow-2xl transition-all"
            style={{
              backgroundImage: 'linear-gradient(135deg, #2563eb, #9333ea)',
            }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Started — It's Free
            </span>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ESL Speak</span>
            </div>
            <p className="text-sm">
              © 2026 ESL Speak. AI-Powered English Learning Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}