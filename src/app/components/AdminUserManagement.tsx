import { useState } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Search, UserCheck, UserX, Edit, Shield } from 'lucide-react';
import type { Page } from '../App';

interface AdminUserManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const mockUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'user', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'recruiter', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'user', status: 'inactive', createdAt: '2024-03-10' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', role: 'recruiter', status: 'active', createdAt: '2024-03-25' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', role: 'user', status: 'active', createdAt: '2024-04-01' },
  { id: 6, name: 'Vũ Thị F', email: 'vuthif@email.com', role: 'user', status: 'inactive', createdAt: '2024-04-15' },
];

export function AdminUserManagement({ onNavigate, onLogout }: AdminUserManagementProps) {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user));
  };

  const handleEditUser = (user: typeof mockUsers[0]) => { setEditingUser({ ...user }); setIsEditDialogOpen(true); };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  const stats = { total: users.length, active: users.filter(u => u.status === 'active').length, inactive: users.filter(u => u.status === 'inactive').length, recruiters: users.filter(u => u.role === 'recruiter').length };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation currentPage="admin-users" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={23} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Users</h1>
          <p className="text-slate-500 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-100"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.total}</p><p className="text-sm text-slate-500">Tổng Users</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-emerald-100"><UserCheck className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.active}</p><p className="text-sm text-slate-500">Active</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-red-100"><UserX className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.inactive}</p><p className="text-sm text-slate-500">Inactive</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-violet-100"><Shield className="w-5 h-5 text-violet-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.recruiters}</p><p className="text-sm text-slate-500">Recruiters</p></div></CardContent></Card>
        </div>

        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả Role</SelectItem><SelectItem value="user">User</SelectItem><SelectItem value="recruiter">Recruiter</SelectItem></SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow className="bg-slate-50"><TableHead className="font-semibold">Người dùng</TableHead><TableHead className="font-semibold">Email</TableHead><TableHead className="font-semibold">Role</TableHead><TableHead className="font-semibold">Trạng thái</TableHead><TableHead className="font-semibold">Ngày tạo</TableHead><TableHead className="font-semibold text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">{user.name.charAt(0)}</div><span className="font-medium">{user.name}</span></div></TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'recruiter' ? 'default' : 'secondary'}>{user.role === 'recruiter' ? 'Recruiter' : 'User'}</Badge></TableCell>
                    <TableCell><Badge className={user.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>{user.status === 'active' ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-slate-500">{user.createdAt}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="text-slate-500 hover:text-slate-900"><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => toggleUserStatus(user.id)} className={user.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'}>{user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}</Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Chỉnh sửa thông tin User</DialogTitle></DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2"><label className="text-sm font-medium">Tên</label><Input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Role</label><Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="recruiter">Recruiter</SelectItem></SelectContent></Select></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleSaveUser}>Lưu thay đổi</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
