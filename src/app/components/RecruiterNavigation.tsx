import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LayoutDashboard, Briefcase, Users, LogOut, Building2, User } from 'lucide-react';
import type { Page } from '../App';

interface RecruiterNavigationProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    newApplicationsCount?: number;
}

export function RecruiterNavigation({ currentPage, onNavigate, onLogout, newApplicationsCount = 0 }: RecruiterNavigationProps) {
    const navItems = [
        { id: 'recruiter-dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'recruiter-jobs' as Page, label: 'Tin tuyển dụng', icon: Briefcase },
        { id: 'recruiter-candidates' as Page, label: 'Ứng viên', icon: Users, badge: newApplicationsCount },
        { id: 'recruiter-profile' as Page, label: 'Hồ sơ cá nhân', icon: User },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('recruiter-dashboard')}>
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <div>
                            <span className="text-xl font-bold text-gray-900">CareerMate</span>
                            <span className="text-xs text-gray-500 ml-2">Recruiter</span>
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
