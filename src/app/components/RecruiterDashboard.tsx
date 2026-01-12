import { useState, useEffect } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Users, FileCheck, Clock, TrendingUp, Plus, ArrowUpRight, Eye, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Page } from '../App';
import { recruiterAPI } from '../../services/api';

interface RecruiterDashboardProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

interface DashboardStats {
    activeJobs: number;
    totalCandidates: number;
    newCandidates: number;
    interviewed: number;
}

interface Application {
    id: number;
    name: string;
    position: string;
    matchScore: number;
    time: string;
    status: string;
}

interface ActiveJob {
    id: number;
    title: string;
    applications: number;
    views: number;
    status: string;
}

interface TrendData {
    day: string;
    applications: number;
}

export function RecruiterDashboard({ onNavigate, onLogout }: RecruiterDashboardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        activeJobs: 0,
        totalCandidates: 0,
        newCandidates: 0,
        interviewed: 0
    });
    const [applicationTrend, setApplicationTrend] = useState<TrendData[]>([]);
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch dashboard stats
            const dashboardResult = await recruiterAPI.getDashboardStats();

            if (dashboardResult.stats) {
                setStats({
                    activeJobs: dashboardResult.stats.active_jobs || 0,
                    totalCandidates: dashboardResult.stats.total_candidates || 0,
                    newCandidates: dashboardResult.stats.new_candidates || 0,
                    interviewed: dashboardResult.stats.interviewed || 0
                });
            }

            if (dashboardResult.trend) {
                setApplicationTrend(dashboardResult.trend.map((t: any) => ({
                    day: t.day,
                    applications: t.applications
                })));
            } else {
                // Default trend data if not available
                setApplicationTrend([
                    { day: 'T2', applications: 0 },
                    { day: 'T3', applications: 0 },
                    { day: 'T4', applications: 0 },
                    { day: 'T5', applications: 0 },
                    { day: 'T6', applications: 0 },
                    { day: 'T7', applications: 0 },
                    { day: 'CN', applications: 0 },
                ]);
            }

            // Fetch recent applications
            const applicationsResult = await recruiterAPI.getApplications();
            if (applicationsResult.applications) {
                const mappedApps: Application[] = applicationsResult.applications.slice(0, 5).map((app: any) => ({
                    id: app.id || app.application_id,
                    name: app.candidate_name || app.name || 'Unknown',
                    position: app.job_title || app.position || 'Unknown Position',
                    matchScore: app.match_score || 80,
                    time: formatTimeAgo(app.applied_at || app.created_at),
                    status: app.status || 'new'
                }));
                setRecentApplications(mappedApps);
            }

            // Fetch active jobs
            const jobsResult = await recruiterAPI.getMyJobs('active');
            if (jobsResult.jobs) {
                const mappedJobs: ActiveJob[] = jobsResult.jobs.slice(0, 3).map((job: any) => ({
                    id: job.id || job.job_id,
                    title: job.title,
                    applications: job.application_count || 0,
                    views: job.view_count || 0,
                    status: job.status || 'active'
                }));
                setActiveJobs(mappedJobs);
            }

        } catch (err) {
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'Gần đây';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const dashboardStats = [
        { title: 'Tin đang hoạt động', value: stats.activeJobs.toString(), icon: Briefcase, color: 'from-blue-500 to-blue-600' },
        { title: 'Tổng ứng viên', value: stats.totalCandidates.toString(), icon: Users, color: 'from-emerald-500 to-emerald-600' },
        { title: 'Ứng viên mới', value: stats.newCandidates.toString(), icon: Clock, color: 'from-amber-500 to-orange-500' },
        { title: 'Đã phỏng vấn', value: stats.interviewed.toString(), icon: FileCheck, color: 'from-violet-500 to-purple-600' },
    ];

    const getStatusBadge = (status: string) => {
        if (status === 'new') return <Badge className="bg-blue-100 text-blue-700">Mới</Badge>;
        if (status === 'reviewing') return <Badge className="bg-amber-100 text-amber-700">Đang xem</Badge>;
        if (status === 'interview') return <Badge className="bg-violet-100 text-violet-700">Phỏng vấn</Badge>;
        return null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <RecruiterNavigation currentPage="recruiter-dashboard" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={0} />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-500">Đang tải dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <RecruiterNavigation currentPage="recruiter-dashboard" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={stats.newCandidates} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Xin chào! Đây là tổng quan tuyển dụng của bạn.</p>
                    </div>
                    <Button onClick={() => onNavigate('recruiter-jobs')} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />Đăng tin mới
                    </Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <Button variant="ghost" size="sm" onClick={() => fetchDashboardData()} className="ml-auto">Thử lại</Button>
                    </div>
                )}

                <div className="grid grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}><Icon className="w-6 h-6 text-white" /></div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <Card className="col-span-2 border-0 shadow-lg">
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" />Lượt ứng tuyển trong tuần</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={applicationTrend}>
                                    <defs><linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="day" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Area type="monotone" dataKey="applications" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorApp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500" />Tin đang tuyển</span>
                                <Button variant="ghost" size="sm" onClick={() => onNavigate('recruiter-jobs')}>Xem tất cả<ArrowUpRight className="w-4 h-4 ml-1" /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeJobs.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p>Chưa có tin đang tuyển</p>
                                </div>
                            ) : (
                                activeJobs.map((job) => (
                                    <div key={job.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-slate-900 text-sm">{job.title}</h4>
                                            {job.status === 'pending' && (<Badge className="bg-amber-100 text-amber-700 text-xs">Chờ duyệt</Badge>)}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.applications} ứng viên</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {job.views} lượt xem</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" />Ứng viên gần đây</span>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('recruiter-candidates')}>Xem tất cả<ArrowUpRight className="w-4 h-4 ml-1" /></Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentApplications.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>Chưa có ứng viên nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentApplications.map((app) => (
                                    <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">{app.name.charAt(0)}</div>
                                            <div><p className="font-medium text-slate-900">{app.name}</p><p className="text-sm text-slate-500">Ứng tuyển: {app.position}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`text-sm font-semibold ${app.matchScore >= 90 ? 'text-emerald-600' : app.matchScore >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>{app.matchScore}% Match</span>
                                                <p className="text-xs text-slate-400">{app.time}</p>
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
