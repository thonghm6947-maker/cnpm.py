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
  ArrowDownRight
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

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 180 },
  { month: 'Mar', users: 250 },
  { month: 'Apr', users: 310 },
  { month: 'May', users: 420 },
  { month: 'Jun', users: 580 },
];

const revenueData = [
  { month: 'Jan', revenue: 12000000 },
  { month: 'Feb', revenue: 18500000 },
  { month: 'Mar', revenue: 22000000 },
  { month: 'Apr', revenue: 28000000 },
  { month: 'May', revenue: 35000000 },
  { month: 'Jun', revenue: 42000000 },
];

const recentActivities = [
  { id: 1, type: 'user_register', message: 'Nguyễn Văn A đã đăng ký tài khoản', time: '5 phút trước' },
  { id: 2, type: 'job_submit', message: 'Công ty ABC gửi tin tuyển dụng mới', time: '15 phút trước' },
  { id: 3, type: 'subscription', message: 'Công ty XYZ nâng cấp gói Premium', time: '1 giờ trước' },
  { id: 4, type: 'user_register', message: 'Trần Thị B đã đăng ký tài khoản', time: '2 giờ trước' },
  { id: 5, type: 'job_approve', message: 'Tin tuyển dụng "Senior Developer" đã được duyệt', time: '3 giờ trước' },
];

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const stats = [
    { title: 'Tổng Users', value: '2,847', change: '+12.5%', isUp: true, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Users Active', value: '1,923', change: '+8.2%', isUp: true, icon: UserCheck, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Tin chờ duyệt', value: '23', change: '-5 tin', isUp: false, icon: FileCheck, color: 'from-amber-500 to-orange-500' },
    { title: 'Doanh thu tháng', value: '42M VNĐ', change: '+20%', isUp: true, icon: CreditCard, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-dashboard" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Xin chào! Đây là tổng quan hệ thống hôm nay.</p>
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
                Tăng trưởng Users
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
                Doanh thu theo tháng
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
                    formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
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
              Hoạt động gần đây
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
