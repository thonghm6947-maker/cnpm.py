import { useState } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { CreditCard, TrendingUp, Users, DollarSign, Edit, Check, Crown, Zap, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Page } from '../App';

interface AdminSubscriptionsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const revenueHistory = [
  { month: 'Jan', revenue: 12000000 },
  { month: 'Feb', revenue: 18500000 },
  { month: 'Mar', revenue: 22000000 },
  { month: 'Apr', revenue: 28000000 },
  { month: 'May', revenue: 35000000 },
  { month: 'Jun', revenue: 42000000 },
];

const subscriptionDistribution = [
  { name: 'Free', value: 1500, color: '#94a3b8' },
  { name: 'Premium', value: 400, color: '#8b5cf6' },
];

const initialPlans = [
  { id: 1, name: 'Premium', price: 199000, duration: 30, features: ['CV Analyzer nâng cao', 'Career Coach AI', 'Unlimited apply', 'Priority support'], icon: Crown, color: 'from-violet-500 to-purple-600', subscribers: 400 },
];

export function AdminSubscriptions({ onNavigate, onLogout }: AdminSubscriptionsProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingPlan, setEditingPlan] = useState<typeof initialPlans[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const totalRevenue = revenueHistory.reduce((sum, item) => sum + item.revenue, 0);
  const totalSubscribers = subscriptionDistribution.reduce((sum, item) => sum + item.value, 0);
  const paidSubscribers = totalSubscribers - 1500;
  const mrr = plans.reduce((sum, plan) => sum + (plan.price * plan.subscribers), 0);

  const handleEditPlan = (plan: typeof initialPlans[0]) => { setEditingPlan({ ...plan }); setIsEditDialogOpen(true); };
  const handleSavePlan = () => { if (editingPlan) { setPlans(plans.map(plan => plan.id === editingPlan.id ? editingPlan : plan)); setIsEditDialogOpen(false); setEditingPlan(null); } };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-subscriptions" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Subscriptions</h1>
          <p className="text-slate-500 mt-1">Quản lý gói dịch vụ và theo dõi doanh thu</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600"><DollarSign className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Tổng doanh thu</p><p className="text-2xl font-bold text-slate-900">{(totalRevenue / 1000000).toFixed(0)}M</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"><TrendingUp className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">MRR</p><p className="text-2xl font-bold text-slate-900">{(mrr / 1000000).toFixed(1)}M</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600"><Users className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Paid Subscribers</p><p className="text-2xl font-bold text-slate-900">{paidSubscribers.toLocaleString()}</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"><CreditCard className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Conversion Rate</p><p className="text-2xl font-bold text-slate-900">{((paidSubscribers / totalSubscribers) * 100).toFixed(1)}%</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2 border-0 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Doanh thu theo tháng</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueHistory}>
                  <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-violet-500" />Phân bố Subscribers</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={subscriptionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{subscriptionDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} /></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">{subscriptionDistribution.map((item) => (<div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-xs text-slate-600">{item.name}</span></div>))}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-500" />Các gói dịch vụ</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div key={plan.id} className="relative p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all">
                    <div className={`absolute -top-4 left-6 p-2 rounded-lg bg-gradient-to-br ${plan.color}`}><Icon className="w-5 h-5 text-white" /></div>
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold text-slate-900">{plan.name}</h3><Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}><Edit className="w-4 h-4" /></Button></div>
                      <div className="mb-4"><span className="text-3xl font-bold text-slate-900">{(plan.price / 1000).toFixed(0)}K</span><span className="text-slate-500"> VNĐ/{plan.duration} ngày</span></div>
                      <ul className="space-y-2 mb-4">{plan.features.map((feature, idx) => (<li key={idx} className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" />{feature}</li>))}</ul>
                      <Badge variant="secondary" className="w-full justify-center py-1">{plan.subscribers.toLocaleString()} subscribers</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Chỉnh sửa gói {editingPlan?.name}</DialogTitle></DialogHeader>
            {editingPlan && (
              <div className="space-y-4 py-4">
                <div className="space-y-2"><label className="text-sm font-medium">Tên gói</label><Input value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Giá (VNĐ)</label><Input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Thời hạn (ngày)</label><Input type="number" value={editingPlan.duration} onChange={(e) => setEditingPlan({ ...editingPlan, duration: parseInt(e.target.value) })} /></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleSavePlan}>Lưu thay đổi</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
