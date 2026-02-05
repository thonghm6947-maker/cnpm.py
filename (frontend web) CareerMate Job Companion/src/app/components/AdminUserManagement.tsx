import { useState, useEffect } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Users, Search, UserCheck, UserX, Eye, Shield,
  Briefcase, Building2, Mail, Phone, Calendar,
  MapPin, FileText, Loader2, AlertCircle, User, GraduationCap
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import type { Page } from '../App';

interface AdminUserManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  role: 'candidate' | 'recruiter' | 'admin';
  status: 'active' | 'inactive';
  phone?: string;
  created_at: string;
  // Candidate Profile
  candidate_profile?: {
    id: number;
    bio?: string;
    location?: string;
    experience_years?: number;
    education?: string;
    current_position?: string;
    resume_count?: number;
    application_count?: number;
    skills?: string[];
  };
  // Recruiter Profile
  recruiter_profile?: {
    id: number;
    company_name?: string;
    company_website?: string;
    company_size?: string;
    industry?: string;
    location?: string;
    job_post_count?: number;
    total_applications_received?: number;
  };
}

export function AdminUserManagement({ onNavigate, onLogout }: AdminUserManagementProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const role = roleFilter === 'all' ? '' : roleFilter;
      const response = await adminAPI.getUsers(role);

      if (response.success && response.users) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleUserStatus = async (userId: number) => {
    try {
      setActionLoading(userId);
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'inactive' : 'active';

      // Call API to update user status
      const response = await adminAPI.updateUserStatus(userId, newStatus);

      if (response.success) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        ));
        // Update selected user if viewing details
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      } else {
        console.error('Failed to update user status:', response.message);
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    candidates: users.filter(u => u.role === 'candidate').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'recruiter':
        return 'bg-violet-100 text-violet-700 hover:bg-violet-100';
      case 'candidate':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'admin':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'recruiter':
        return <Building2 className="w-4 h-4" />;
      case 'candidate':
        return <User className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-users" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage Candidate and Recruiter accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
                <p className="text-sm text-slate-500">Inactive</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-100">
                <User className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.candidates}</p>
                <p className="text-sm text-slate-500">Candidates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-violet-100">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.recruiters}</p>
                <p className="text-sm text-slate-500">Recruiters</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchUsers} variant="outline" className="gap-2">
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-0 shadow-lg mb-6 bg-red-50 border-l-4 border-red-500">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchUsers}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <span className="ml-3 text-slate-500">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Account Type</TableHead>
                    <TableHead className="font-semibold">Profile Info</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${user.role === 'recruiter'
                              ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                              }`}>
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <span className="font-medium block">{user.full_name || 'N/A'}</span>
                              {user.phone && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadgeStyle(user.role)} gap-1`}>
                            {getRoleIcon(user.role)}
                            {user.role === 'recruiter' ? 'Recruiter' : user.role === 'candidate' ? 'Candidate' : 'Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'candidate' && user.candidate_profile && (
                            <div className="text-xs space-y-1">
                              {user.candidate_profile.current_position && (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Briefcase className="w-3 h-3" />
                                  {user.candidate_profile.current_position}
                                </div>
                              )}
                              {user.candidate_profile.location && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3" />
                                  {user.candidate_profile.location}
                                </div>
                              )}
                            </div>
                          )}
                          {user.role === 'recruiter' && user.recruiter_profile && (
                            <div className="text-xs space-y-1">
                              {user.recruiter_profile.company_name && (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Building2 className="w-3 h-3" />
                                  {user.recruiter_profile.company_name}
                                </div>
                              )}
                              {user.recruiter_profile.industry && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Briefcase className="w-3 h-3" />
                                  {user.recruiter_profile.industry}
                                </div>
                              )}
                            </div>
                          )}
                          {!user.candidate_profile && !user.recruiter_profile && (
                            <span className="text-slate-400 text-xs">Not updated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                          }>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(user)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                              disabled={actionLoading === user.id}
                              className={user.status === 'active'
                                ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.status === 'active' ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${selectedUser?.role === 'recruiter'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  }`}>
                  {selectedUser?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedUser?.full_name || 'N/A'}</p>
                  <Badge className={getRoleBadgeStyle(selectedUser?.role || '')}>
                    {selectedUser?.role === 'recruiter' ? 'Recruiter' : selectedUser?.role === 'candidate' ? 'Candidate' : 'Admin'}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="profile">
                    {selectedUser.role === 'recruiter' ? 'Recruiter Profile' : 'Candidate Profile'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Phone Number</p>
                          <p className="font-medium">{selectedUser.phone || 'Not updated'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Date Created</p>
                          <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Status</p>
                          <Badge className={selectedUser.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                          }>
                            {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-4 mt-4">
                  {selectedUser.role === 'candidate' && (
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Candidate Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedUser.candidate_profile ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Current Position</p>
                                <p className="font-medium flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-violet-500" />
                                  {selectedUser.candidate_profile.current_position || 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Experience</p>
                                <p className="font-medium">
                                  {selectedUser.candidate_profile.experience_years
                                    ? `${selectedUser.candidate_profile.experience_years} years`
                                    : 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Location</p>
                                <p className="font-medium flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-emerald-500" />
                                  {selectedUser.candidate_profile.location || 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Education</p>
                                <p className="font-medium flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-blue-500" />
                                  {selectedUser.candidate_profile.education || 'Not updated'}
                                </p>
                              </div>
                            </div>

                            {selectedUser.candidate_profile.bio && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-1">Bio</p>
                                <p className="text-sm text-slate-600">{selectedUser.candidate_profile.bio}</p>
                              </div>
                            )}

                            {selectedUser.candidate_profile.skills && selectedUser.candidate_profile.skills.length > 0 && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedUser.candidate_profile.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-slate-100">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <FileText className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                                <p className="text-xl font-bold text-blue-700">
                                  {selectedUser.candidate_profile.resume_count || 0}
                                </p>
                                <p className="text-xs text-blue-600">Uploaded CVs</p>
                              </div>
                              <div className="bg-violet-50 rounded-lg p-3 text-center">
                                <Briefcase className="w-6 h-6 mx-auto text-violet-500 mb-1" />
                                <p className="text-xl font-bold text-violet-700">
                                  {selectedUser.candidate_profile.application_count || 0}
                                </p>
                                <p className="text-xs text-violet-600">Applications</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No profile information</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selectedUser.role === 'recruiter' && (
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Recruiter Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedUser.recruiter_profile ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Company</p>
                                <p className="font-medium flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-violet-500" />
                                  {selectedUser.recruiter_profile.company_name || 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Industry</p>
                                <p className="font-medium">
                                  {selectedUser.recruiter_profile.industry || 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Location</p>
                                <p className="font-medium flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-emerald-500" />
                                  {selectedUser.recruiter_profile.location || 'Not updated'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400">Company Size</p>
                                <p className="font-medium">
                                  {selectedUser.recruiter_profile.company_size || 'Not updated'}
                                </p>
                              </div>
                            </div>

                            {selectedUser.recruiter_profile.company_website && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-1">Website</p>
                                <a
                                  href={selectedUser.recruiter_profile.company_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  {selectedUser.recruiter_profile.company_website}
                                </a>
                              </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                              <div className="bg-violet-50 rounded-lg p-3 text-center">
                                <Briefcase className="w-6 h-6 mx-auto text-violet-500 mb-1" />
                                <p className="text-xl font-bold text-violet-700">
                                  {selectedUser.recruiter_profile.job_post_count || 0}
                                </p>
                                <p className="text-xs text-violet-600">Job Posts</p>
                              </div>
                              <div className="bg-cyan-50 rounded-lg p-3 text-center">
                                <FileText className="w-6 h-6 mx-auto text-cyan-500 mb-1" />
                                <p className="text-xl font-bold text-cyan-700">
                                  {selectedUser.recruiter_profile.total_applications_received || 0}
                                </p>
                                <p className="text-xs text-cyan-600">Applications Received</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No company profile</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => selectedUser && toggleUserStatus(selectedUser.id)}
                className={selectedUser?.status === 'active'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
                }
              >
                {selectedUser?.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
