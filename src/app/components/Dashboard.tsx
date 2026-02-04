import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  FileText,
  MessageSquare,
  Briefcase,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Bookmark
} from 'lucide-react';
import type { Page } from '../App';
import { jobAPI, authAPI } from '../../services/api';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface DashboardStats {
  jobsApplied: number;
  pendingResponses: number;
  savedJobs: number;
}

interface RecommendedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  created_at: string;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    jobsApplied: 0,
    pendingResponses: 0,
    savedJobs: 0
  });
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user info
      const userResult = await authAPI.getMe();
      if (userResult.full_name) {
        setUserName(userResult.full_name);
      } else if (userResult.email) {
        // Fallback to email username if no full name
        setUserName(userResult.email.split('@')[0]);
      }

      // Fetch applications
      const applicationsResult = await jobAPI.getMyApplications();
      const applications = applicationsResult.applications || [];
      const pendingCount = applications.filter((app: any) =>
        ['pending', 'submitted', 'reviewing'].includes(String(app.status || '').toLowerCase())
      ).length;

      // Fetch saved jobs
      const savedResult = await jobAPI.getSavedJobs();
      const savedJobs = savedResult.saved_jobs || [];

      setStats({
        jobsApplied: applications.length,
        pendingResponses: pendingCount,
        savedJobs: savedJobs.length
      });

      // Fetch recommended jobs (latest approved jobs)
      const jobsResult = await jobAPI.list(1, 5);
      if (jobsResult.jobs) {
        const mappedJobs: RecommendedJob[] = jobsResult.jobs.map((job: any) => ({
          id: job.id || job.job_id,
          title: job.title,
          company: job.company_name || job.company || 'Company',
          location: job.location || 'Remote',
          created_at: job.created_at
        }));
        setRecommendedJobs(mappedJobs);
      }

    } catch (err) {
      setError('Unable to load dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => fetchDashboardData()} className="ml-auto">Retry</Button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Welcome back, {userName || 'User'}! 👋</h1>
          <p className="text-gray-600">Here's your career progress overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">CV Score</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl mb-1">--/100</div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Analyze your CV to get a score</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Jobs Applied</span>
              <Briefcase className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl mb-1">{stats.jobsApplied}</div>
            <p className="text-sm text-gray-500">{stats.pendingResponses} pending responses</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Saved Jobs</span>
              <Bookmark className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl mb-1">{stats.savedJobs}</div>
            <p className="text-sm text-gray-500">Jobs bookmarked</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Badges Earned</span>
              <Award className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl mb-1">--</div>
            <p className="text-sm text-gray-500">Coming soon</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors"
                  onClick={() => onNavigate('cv-analyzer')}
                >
                  <FileText className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="mb-2">Analyze Your CV</h3>
                  <p className="text-sm text-gray-600">Get AI-powered feedback and improve your resume score</p>
                </div>

                <div
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 cursor-pointer transition-colors"
                  onClick={() => onNavigate('career-coach')}
                >
                  <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="mb-2">Career Coaching</h3>
                  <p className="text-sm text-gray-600">Chat with AI coach for personalized career guidance</p>
                </div>

                <div
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer transition-colors"
                  onClick={() => onNavigate('jobs')}
                >
                  <Briefcase className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="mb-2">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Find jobs matching your skills and interests</p>
                </div>

                <div
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-600 cursor-pointer transition-colors"
                  onClick={() => onNavigate('learning')}
                >
                  <BookOpen className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="mb-2">Learning Hub</h3>
                  <p className="text-sm text-gray-600">Explore courses and improve your skills</p>
                </div>
              </div>
            </Card>

            {/* Career Roadmap Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Your Career Roadmap</h2>
                <Button variant="outline" size="sm" onClick={() => onNavigate('career-roadmap')}>
                  View Roadmap
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4>Complete Profile Setup</h4>
                      <span className="text-sm text-gray-500">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4>Upload & Optimize CV</h4>
                      <span className="text-sm text-gray-500">In Progress</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4>Apply to Jobs</h4>
                      <span className="text-sm text-gray-500">{stats.jobsApplied > 0 ? `${stats.jobsApplied} applied` : 'Not started'}</span>
                    </div>
                    <Progress value={Math.min(stats.jobsApplied * 5, 100)} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommended Jobs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Recommended Jobs</h2>
                <Button variant="ghost" onClick={() => onNavigate('jobs')}>View All</Button>
              </div>
              <div className="space-y-4">
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No jobs available at the moment</p>
                    <Button variant="outline" className="mt-4" onClick={() => onNavigate('jobs')}>
                      Browse All Jobs
                    </Button>
                  </div>
                ) : (
                  recommendedJobs.map((job) => (
                    <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <Badge variant="secondary">New</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>Posted {formatTimeAgo(job.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Activity & Achievements */}
          <div className="space-y-6">
            {/* Skill Gap Analysis */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Skill Gap Analysis</h2>
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Analyze your CV to see skill recommendations</p>
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => onNavigate('cv-analyzer')}>
                Analyze CV
              </Button>
            </Card>

            {/* Recent Achievements */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Recent Achievements</h2>
              <div className="space-y-3">
                {stats.jobsApplied > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-medium">Job Hunter</div>
                      <div className="text-sm text-gray-600">Applied to {stats.jobsApplied} job{stats.jobsApplied > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}
                {stats.savedJobs > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">📌</div>
                    <div>
                      <div className="font-medium">Researcher</div>
                      <div className="text-sm text-gray-600">Saved {stats.savedJobs} job{stats.savedJobs > 1 ? 's' : ''} for later</div>
                    </div>
                  </div>
                )}
                {stats.jobsApplied === 0 && stats.savedJobs === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Start applying to jobs to earn achievements!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Feed */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Recent Activity</h2>
              <div className="space-y-4 text-sm">
                {stats.jobsApplied > 0 ? (
                  <>
                    <div className="flex gap-3">
                      <Briefcase className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">You've applied to {stats.jobsApplied} job{stats.jobsApplied > 1 ? 's' : ''}</p>
                        <p className="text-gray-500">Keep going!</p>
                      </div>
                    </div>
                    {stats.pendingResponses > 0 && (
                      <div className="flex gap-3">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{stats.pendingResponses} application{stats.pendingResponses > 1 ? 's' : ''} pending</p>
                          <p className="text-gray-500">Waiting for response</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                    <p className="text-xs mt-1">Start your job search today!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
