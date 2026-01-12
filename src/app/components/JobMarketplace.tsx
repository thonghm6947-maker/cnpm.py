import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Heart,
  ExternalLink,
  Filter,
  TrendingUp,
  Star,
  Bookmark,
  Loader2
} from 'lucide-react';
import type { Page } from '../App';
import { jobAPI } from '../../services/api';

interface JobMarketplaceProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Job {
  id: number;
  job_id?: string;
  title: string;
  company: string;
  company_name?: string;
  location: string;
  type: string;
  job_type?: string;
  salary: string;
  salary_range?: string;
  posted: string;
  created_at?: string;
  match: number;
  description: string;
  requirements: string[];
  isSaved: boolean;
  is_saved?: boolean;
}

interface ApplicationStats {
  applied: number;
  inReview: number;
  interviews: number;
  savedJobs: number;
}

export function JobMarketplace({ onNavigate, onLogout }: JobMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('best-match');
  const [applying, setApplying] = useState<number | null>(null);
  const [stats, setStats] = useState<ApplicationStats>({
    applied: 0,
    inReview: 0,
    interviews: 0,
    savedJobs: 0
  });

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchApplicationStats();
  }, []);

  const fetchJobs = async (search = '', location = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobAPI.list(1, 20, search, location);
      if (result.jobs) {
        const mappedJobs: Job[] = result.jobs.map((job: any) => ({
          id: job.job_id || job.id,
          title: job.title,
          company: job.company_name || job.company || 'Unknown Company',
          location: job.location || 'Remote',
          type: job.job_type || job.type || 'Full-time',
          salary: job.salary_range || job.salary || 'Competitive',
          posted: formatDate(job.created_at) || 'Recently',
          match: job.match_score || Math.floor(Math.random() * 20) + 75,
          description: job.description || '',
          requirements: job.requirements || job.skills || [],
          isSaved: job.is_saved || false
        }));
        setJobs(mappedJobs);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Không thể tải danh sách việc làm. Vui lòng thử lại sau.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const result = await jobAPI.getSavedJobs();
      if (result.jobs) {
        const mappedJobs: Job[] = result.jobs.map((job: any) => ({
          id: job.job_id || job.id,
          title: job.title,
          company: job.company_name || job.company || 'Unknown Company',
          location: job.location || 'Remote',
          type: job.job_type || job.type || 'Full-time',
          salary: job.salary_range || job.salary || 'Competitive',
          posted: formatDate(job.created_at) || 'Recently',
          match: job.match_score || 80,
          description: job.description || '',
          requirements: job.requirements || job.skills || [],
          isSaved: true
        }));
        setSavedJobs(mappedJobs);
        setStats(prev => ({ ...prev, savedJobs: mappedJobs.length }));
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const result = await jobAPI.getMyApplications();
      if (result.applications) {
        const apps = result.applications;
        setStats(prev => ({
          ...prev,
          applied: apps.length,
          inReview: apps.filter((a: any) => a.status === 'reviewing' || a.status === 'pending').length,
          interviews: apps.filter((a: any) => a.status === 'interview').length
        }));
      }
    } catch (err) {
      console.error('Error fetching application stats:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleSearch = () => {
    fetchJobs(searchQuery, locationQuery);
  };

  const handleSaveJob = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobAPI.saveJob(jobId);
      // Toggle saved state locally
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      ));
      fetchSavedJobs(); // Refresh saved jobs
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApply = async (jobId: number) => {
    setApplying(jobId);
    try {
      const result = await jobAPI.apply(jobId, null, '');
      if (result.application_id || result.message) {
        alert('Đã nộp đơn thành công!');
        fetchApplicationStats();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.');
    } finally {
      setApplying(null);
    }
  };

  const displayJobs = activeTab === 'saved' ? savedJobs : jobs;

  const topCompanies = [
    { name: 'Google', openings: 45, rating: 4.8 },
    { name: 'Microsoft', openings: 38, rating: 4.7 },
    { name: 'Meta', openings: 32, rating: 4.6 },
    { name: 'Amazon', openings: 56, rating: 4.5 },
    { name: 'Apple', openings: 28, rating: 4.9 }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="jobs" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 text-gray-900">Job Marketplace</h1>
          <p className="text-gray-600">Find your perfect job match with AI recommendations</p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Location" className="pl-10 w-48" />
              </div>
            </div>
            <Button>Search</Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl">Recommended for You</h2>
                <p className="text-sm text-gray-600">{jobs.length} jobs match your profile</p>
              </div>
              <Tabs defaultValue="best-match">
                <TabsList>
                  <TabsTrigger value="best-match">Best Match</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {jobs.map((job) => (
              <Card
                key={job.id}
                className={`p-6 cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-blue-600 shadow-lg' : 'hover:border-gray-300'
                  }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl">{job.title}</h3>
                      <Badge variant="secondary">{job.match}% Match</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Building2 className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {job.isSaved ? (
                      <Bookmark className="w-5 h-5 fill-blue-600 text-blue-600" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.posted}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.requirements.slice(0, 4).map((req, index) => (
                    <Badge key={index} variant="outline">{req}</Badge>
                  ))}
                  {job.requirements.length > 4 && (
                    <Badge variant="outline">+{job.requirements.length - 4} more</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm">Apply Now</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Job Details */}
            {selectedJob && (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl">Job Details</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)}>
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1">{selectedJob.title}</h4>
                    <p className="text-sm text-gray-600">{selectedJob.company}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedJob.match}% Match</Badge>
                    <Badge>{selectedJob.type}</Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedJob.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Requirements</h4>
                    <div className="space-y-1">
                      {selectedJob.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button className="w-full">Apply Now</Button>
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View on Company Site
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Application Stats */}
            <Card className="p-6">
              <h3 className="mb-4">Your Application Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Applied</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm">In Review</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm">Interviews</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Saved Jobs</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </Card>

            {/* Top Companies */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Top Companies Hiring</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors">
                    <div>
                      <div className="font-medium mb-1">{company.name}</div>
                      <div className="text-sm text-gray-600">{company.openings} openings</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{company.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Career Tips */}
            <Card className="p-6 bg-blue-600 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <h3>Application Tip</h3>
              </div>
              <p className="text-sm opacity-90">
                Tailor your CV for each application by matching keywords from the job description.
                This increases your chances by up to 60%!
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => onNavigate('cv-analyzer')}>
                Optimize CV
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
