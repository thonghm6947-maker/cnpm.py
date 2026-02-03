import { useState, useEffect } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Users,
  Briefcase,
  CreditCard,
  TrendingUp,
  UserCheck,
  FileCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import type { Page } from '../App';
import { adminAPI } from '../../services/api';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  pending_jobs: number;
  approved_jobs: number;
  rejected_jobs: number;
  total_applications: number;
  total_subscriptions: number;
  monthly_revenue: number;
  user_growth: { month: string; users: number }[];
  revenue_data: { month: string; revenue: number }[];
  recent_activities: { id: number; type: string; message: string; time: string }[];
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboardStats();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Cannot load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format number with comma separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('vi-VN');
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B VNĐ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M VNĐ`;
    }
    return `${formatNumber(amount)} VNĐ`;
  };

  // Default fallback data
  const userGrowthData = dashboardData?.user_growth || [
    { month: 'T1', users: 0 },
    { month: 'T2', users: 0 },
    { month: 'T3', users: 0 },
    { month: 'T4', users: 0 },
    { month: 'T5', users: 0 },
    { month: 'T6', users: 0 },
  ];

  const revenueData = dashboardData?.revenue_data || [
    { month: 'T1', revenue: 0 },
    { month: 'T2', revenue: 0 },
    { month: 'T3', revenue: 0 },
    { month: 'T4', revenue: 0 },
    { month: 'T5', revenue: 0 },
    { month: 'T6', revenue: 0 },
  ];

  const recentActivities = dashboardData?.recent_activities || [];

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData ? formatNumber(dashboardData.total_users) : '0',
      subtext: `${dashboardData?.total_candidates || 0} candidates, ${dashboardData?.total_recruiters || 0} recruiters`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      isUp: true,
      change: '+12%'
    },
    {
      title: 'Active Users',
      value: dashboardData ? formatNumber(dashboardData.active_users) : '0',
      subtext: 'Active in 30 days',
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      isUp: true,
      change: '+5%'
    },
    {
      title: 'Pending Jobs',
      value: dashboardData ? formatNumber(dashboardData.pending_jobs) : '0',
      subtext: `${dashboardData?.approved_jobs || 0} approved, ${dashboardData?.rejected_jobs || 0} rejected`,
      icon: FileCheck,
      color: 'from-amber-500 to-orange-500',
      isUp: false,
      change: '-2%'
    },
    {
      title: 'Monthly Revenue',
      value: dashboardData ? formatCurrency(dashboardData.monthly_revenue) : '0 VNĐ',
      subtext: `${dashboardData?.total_subscriptions || 0} subscriptions`,
      icon: CreditCard,
      color: 'from-violet-500 to-purple-600',
      isUp: true,
      change: '+8%'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-dashboard" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Hello! Here is the system overview for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${stat.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-500" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.type === 'user_register' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'job_submit' ? 'bg-amber-100 text-amber-600' :
                        activity.type === 'subscription' ? 'bg-violet-100 text-violet-600' :
                          'bg-emerald-100 text-emerald-600'
                      }`}>
                      {activity.type === 'user_register' && <Users className="w-4 h-4" />}
                      {activity.type === 'job_submit' && <Briefcase className="w-4 h-4" />}
                      {activity.type === 'subscription' && <CreditCard className="w-4 h-4" />}
                      {activity.type === 'job_approve' && <FileCheck className="w-4 h-4" />}
                    </div>
                    <span className="text-slate-700">{activity.message}</span>
                  </div>
                  <span className="text-sm text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
