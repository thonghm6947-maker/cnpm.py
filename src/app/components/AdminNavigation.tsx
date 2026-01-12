import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileCheck,
  LogOut,
  Shield
} from 'lucide-react';
import type { Page } from '../App';

interface AdminNavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  pendingJobsCount?: number;
}

export function AdminNavigation({
  currentPage,
  onNavigate,
  onLogout,
  pendingJobsCount = 0
}: AdminNavigationProps) {
  const navItems = [
    { id: 'admin-dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users' as Page, label: 'Quản lý Users', icon: Users },
    { id: 'admin-subscriptions' as Page, label: 'Subscriptions', icon: CreditCard },
    { id: 'admin-jobs' as Page, label: 'Duyệt tin', icon: FileCheck, badge: pendingJobsCount },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('admin-dashboard')}>
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <span className="text-xl font-bold text-gray-900">CareerMate</span>
              <span className="text-xs text-gray-500 ml-2">Admin</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-red-500 text-white text-xs ml-1">{item.badge}</Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <Button variant="ghost" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </nav>
  );
}
