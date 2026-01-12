import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, FileText, MessageSquare, Briefcase, BookOpen, Trophy } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CareerMate</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin}>
              Sign In
            </Button>
            <Button onClick={onLogin}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI-Powered Career Platform</span>
          </div>
          <h1 className="text-5xl mb-6 text-gray-900">
            Your AI-Powered Job Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            CareerMate helps final-year students analyze CVs, practice interviews, discover jobs, 
            and build the perfect career roadmap with AI assistance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={onLogin}>
              Start Your Journey
            </Button>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 rounded-lg overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop"
              alt="Students collaborating"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4 text-gray-900">
            Everything You Need to Launch Your Career
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive tools powered by AI to help you succeed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl mb-2">AI CV Analyzer</h3>
            <p className="text-gray-600">
              Get instant feedback on your resume with AI-powered analysis and personalized improvement suggestions.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl mb-2">Career Coach AI</h3>
            <p className="text-gray-600">
              Chat with your personal AI career coach for guidance, mock interviews, and career roadmap planning.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-2">Smart Job Matching</h3>
            <p className="text-gray-600">
              Discover jobs that match your skills with AI-powered recommendations and apply with one click.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl mb-2">Learning Hub</h3>
            <p className="text-gray-600">
              Access curated courses, tutorials, and roadmaps to fill your skill gaps and advance your career.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl mb-2">Gamification</h3>
            <p className="text-gray-600">
              Complete challenges, earn badges, and climb leaderboards while building your professional profile.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl mb-2">Premium Features</h3>
            <p className="text-gray-600">
              Unlock advanced AI features, priority support, and exclusive content with premium membership.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-2 text-blue-600">50K+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div>
            <div className="text-4xl mb-2 text-blue-600">10K+</div>
            <div className="text-gray-600">Job Listings</div>
          </div>
          <div>
            <div className="text-4xl mb-2 text-blue-600">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-blue-600 rounded-2xl my-12">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already using AI to land their dream jobs
          </p>
          <Button size="lg" variant="secondary" onClick={onLogin}>
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">CareerMate</span>
        </div>
        <p className="text-sm">© 2026 CareerMate. Your AI-Powered Job Companion.</p>
      </footer>
    </div>
  );
}
