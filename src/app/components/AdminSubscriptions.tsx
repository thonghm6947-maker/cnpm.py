import { useState, useEffect } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { CreditCard, TrendingUp, Users, DollarSign, Edit, Check, Crown, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Page } from '../App';
import { subscriptionAPI } from '../../services/api';

interface AdminSubscriptionsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface SubscriptionPlan {
  package_id: number;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  subscribers: number;
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

export function AdminSubscriptions({ onNavigate, onLogout }: AdminSubscriptionsProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [stats, setStats] = useState({ total_subscribers: 0, active_subscribers: 0, total_revenue: 0, mrr: 0 });

  useEffect(() => {
    fetchPackages();
    fetchStats();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionAPI.getAdminPackages();
      if (result.success && result.packages) {
        setPlans(result.packages);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load subscription packages');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await subscriptionAPI.getStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const totalRevenue = revenueHistory.reduce((sum, item) => sum + item.revenue, 0);
  const totalSubscribers = subscriptionDistribution.reduce((sum, item) => sum + item.value, 0);
  const paidSubscribers = stats.active_subscribers || (totalSubscribers - 1500);
  const mrr = stats.mrr || plans.reduce((sum, plan) => sum + (plan.price * plan.subscribers), 0);

  const handleCreateNew = () => {
    setEditingPlan({
      package_id: 0,
      name: '',
      price: 199000,
      duration_days: 30,
      description: '',
      subscribers: 0
    });
    setIsCreateMode(true);
    setIsEditDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setIsCreateMode(false);
    setIsEditDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setIsSaving(true);
    setError(null);

    try {
      const data = {
        name: editingPlan.name,
        price: editingPlan.price,
        duration_days: editingPlan.duration_days,
        description: editingPlan.description
      };

      let result;
      if (isCreateMode) {
        result = await subscriptionAPI.createPackage(data);
      } else {
        result = await subscriptionAPI.updatePackage(editingPlan.package_id, data);
      }

      if (result.success) {
        await fetchPackages();
        setIsEditDialogOpen(false);
        setEditingPlan(null);
      } else {
        setError(result.error || 'Failed to save package');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const result = await subscriptionAPI.deletePackage(packageId);
      if (result.success) {
        await fetchPackages();
      } else {
        setError(result.error || 'Failed to delete package');
      }
    } catch (err) {
      setError('An error occurred while deleting');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavigation currentPage="admin-subscriptions" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={0} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-slate-500">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-subscriptions" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Subscription Management</h1>
            <p className="text-slate-500 mt-1">Manage subscription plans and track revenue</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-gradient-to-r from-violet-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />Add Package
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Close</Button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600"><DollarSign className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Total Revenue</p><p className="text-2xl font-bold text-slate-900">{(totalRevenue / 1000000).toFixed(0)}M</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"><TrendingUp className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">MRR</p><p className="text-2xl font-bold text-slate-900">{(mrr / 1000000).toFixed(1)}M</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600"><Users className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Paid Subscribers</p><p className="text-2xl font-bold text-slate-900">{paidSubscribers.toLocaleString()}</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"><CreditCard className="w-6 h-6 text-white" /></div><div><p className="text-sm text-slate-500">Conversion Rate</p><p className="text-2xl font-bold text-slate-900">{((paidSubscribers / totalSubscribers) * 100).toFixed(1)}%</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2 border-0 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueHistory}>
                  <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VND`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-violet-500" />Subscriber Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={subscriptionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{subscriptionDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} /></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">{subscriptionDistribution.map((item) => (<div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-xs text-slate-600">{item.name}</span></div>))}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-500" />Subscription Plans</CardTitle></CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No subscription plans yet. Click "Add Package" to create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.package_id} className="relative p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all">
                    <div className="absolute -top-4 left-6 p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600"><Crown className="w-5 h-5 text-white" /></div>
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeletePlan(plan.package_id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="mb-4"><span className="text-3xl font-bold text-slate-900">{(plan.price / 1000).toFixed(0)}K</span><span className="text-slate-500"> VND/{plan.duration_days} days</span></div>
                      {plan.description && (
                        <ul className="space-y-2 mb-4">
                          {plan.description.split('\n').filter(f => f.trim()).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" />{feature}</li>
                          ))}
                        </ul>
                      )}
                      <Badge variant="secondary" className="w-full justify-center py-1">{plan.subscribers.toLocaleString()} subscribers</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{isCreateMode ? 'Create New Package' : `Edit: ${editingPlan?.name}`}</DialogTitle></DialogHeader>
            {editingPlan && (
              <div className="space-y-4 py-4">
                <div className="space-y-2"><label className="text-sm font-medium">Package Name</label><Input value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} placeholder="e.g. Premium" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Price (VND)</label><Input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Duration (days)</label><Input type="number" value={editingPlan.duration_days} onChange={(e) => setEditingPlan({ ...editingPlan, duration_days: parseInt(e.target.value) || 30 })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Features (one per line)</label><Textarea value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} placeholder="CV Analyzer advanced&#10;Career Coach AI&#10;Unlimited apply" rows={4} /></div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSavePlan} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isCreateMode ? 'Create' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
