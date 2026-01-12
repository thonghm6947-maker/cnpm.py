import { Button } from './ui/button';
import { Sparkles, LayoutDashboard, FileText, MessageSquare, Map, Briefcase, BookOpen, User, LogOut } from 'lucide-react';
import type { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cv-analyzer' as Page, label: 'CV Analyzer', icon: FileText },
    { id: 'career-coach' as Page, label: 'Career Coach', icon: MessageSquare },
    { id: 'career-roadmap' as Page, label: 'Roadmap', icon: Map },
    { id: 'jobs' as Page, label: 'Jobs', icon: Briefcase },
    { id: 'learning' as Page, label: 'Learning', icon: BookOpen },
    { id: 'profile' as Page, label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CareerMate</span>
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
                </Button>
              );
            })}
          </div>

          <Button variant="ghost" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
