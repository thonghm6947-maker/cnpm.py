import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { CVAnalyzer } from './components/CVAnalyzer';
import { CareerCoach } from './components/CareerCoach';
import { CareerRoadmap } from './components/CareerRoadmap';
import { JobMarketplace } from './components/JobMarketplace';
import { Profile } from './components/Profile';
import { LearningHub } from './components/LearningHub';
// Admin Components
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminSubscriptions } from './components/AdminSubscriptions';
import { AdminJobReview } from './components/AdminJobReview';
// Recruiter Components
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { RecruiterJobManagement } from './components/RecruiterJobManagement';
import { RecruiterCandidates } from './components/RecruiterCandidates';
import { RecruiterProfile } from './components/RecruiterProfile';

// Extended Page types with Admin and Recruiter pages
export type Page =
  | 'landing' | 'auth' | 'dashboard' | 'cv-analyzer' | 'career-coach' | 'career-roadmap' | 'jobs' | 'profile' | 'learning'
  | 'admin-dashboard' | 'admin-users' | 'admin-subscriptions' | 'admin-jobs'
  | 'recruiter-dashboard' | 'recruiter-jobs' | 'recruiter-candidates' | 'recruiter-profile';

export type UserRole = 'user' | 'admin' | 'recruiter';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Được gọi khi nhấn nút "Bắt đầu" hoặc "Login" ở Landing Page
  const handleStartLogin = () => {
    setCurrentPage('auth');
  };

  // Được gọi khi AuthPage xác thực thành công (Login/Signup xong)
  const handleLoginSuccess = (role: UserRole = 'user') => {
    setIsLoggedIn(true);
    setUserRole(role);

    // Redirect based on role
    switch (role) {
      case 'admin':
        setCurrentPage('admin-dashboard');
        break;
      case 'recruiter':
        setCurrentPage('recruiter-dashboard');
        break;
      default:
        setCurrentPage('dashboard');
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    setCurrentPage('landing');
  };

  // Điều hướng nội bộ
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  // --- LOGIC HIỂN THỊ ---

  // 1. Nếu chưa đăng nhập
  if (!isLoggedIn) {
    // Nếu đang ở trang Auth -> hiển thị AuthPage
    if (currentPage === 'auth') {
      return (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentPage('landing')}
        />
      );
    }

    // Mặc định hiển thị Landing Page
    return <LandingPage onLogin={handleStartLogin} />;
  }

  // 2. Nếu đã đăng nhập - Hiển thị theo role

  // Admin Pages
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        {currentPage === 'admin-dashboard' && (
          <AdminDashboard onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'admin-users' && (
          <AdminUserManagement onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'admin-subscriptions' && (
          <AdminSubscriptions onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'admin-jobs' && (
          <AdminJobReview onNavigate={navigateTo} onLogout={handleLogout} />
        )}
      </div>
    );
  }

  // Recruiter Pages
  if (userRole === 'recruiter') {
    return (
      <div className="min-h-screen bg-slate-50">
        {currentPage === 'recruiter-dashboard' && (
          <RecruiterDashboard onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'recruiter-jobs' && (
          <RecruiterJobManagement onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'recruiter-candidates' && (
          <RecruiterCandidates onNavigate={navigateTo} onLogout={handleLogout} />
        )}
        {currentPage === 'recruiter-profile' && (
          <RecruiterProfile onNavigate={navigateTo} onLogout={handleLogout} />
        )}
      </div>
    );
  }

  // User Pages (default)
  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'cv-analyzer' && (
        <CVAnalyzer onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'career-coach' && (
        <CareerCoach onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'career-roadmap' && (
        <CareerRoadmap onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'jobs' && (
        <JobMarketplace onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'profile' && (
        <Profile onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'learning' && (
        <LearningHub onNavigate={navigateTo} onLogout={handleLogout} />
      )}
    </div>
  );
}