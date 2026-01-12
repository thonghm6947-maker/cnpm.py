import { useState } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Search, Eye, Mail, Phone, MapPin, Calendar, Star, Briefcase, GraduationCap, Clock, Download } from 'lucide-react';
import type { Page } from '../App';

interface RecruiterCandidatesProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const mockCandidates = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', location: 'Hồ Chí Minh', appliedJob: 'Senior Frontend Developer', matchScore: 92, status: 'new', appliedAt: '2024-06-15 09:30', experience: '5 năm', education: 'ĐH Bách Khoa TPHCM', skills: ['React', 'TypeScript', 'Node.js'], summary: 'Frontend Developer với 5 năm kinh nghiệm.' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0912345678', location: 'Hà Nội', appliedJob: 'Backend Engineer', matchScore: 88, status: 'reviewing', appliedAt: '2024-06-15 10:15', experience: '3 năm', education: 'ĐH Công Nghệ', skills: ['Node.js', 'Python', 'MongoDB'], summary: 'Backend Developer với kinh nghiệm microservices.' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789', location: 'Đà Nẵng', appliedJob: 'UI/UX Designer', matchScore: 85, status: 'interview', appliedAt: '2024-06-14 14:00', experience: '4 năm', education: 'ĐH Kiến Trúc', skills: ['Figma', 'Adobe XD'], summary: 'UI/UX Designer với portfolio đa dạng.' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0934567890', location: 'Hồ Chí Minh', appliedJob: 'Senior Frontend Developer', matchScore: 78, status: 'offer', appliedAt: '2024-06-13 09:00', experience: '4 năm', education: 'ĐH KHTN', skills: ['Vue.js', 'React'], summary: 'Fullstack Developer.' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0945678901', location: 'Hồ Chí Minh', appliedJob: 'DevOps Engineer', matchScore: 95, status: 'hired', appliedAt: '2024-06-10 11:00', experience: '6 năm', education: 'ĐH CNTT', skills: ['AWS', 'Kubernetes'], summary: 'Senior DevOps với AWS certification.' },
  { id: 6, name: 'Vũ Thị F', email: 'vuthif@email.com', phone: '0956789012', location: 'Hà Nội', appliedJob: 'Backend Engineer', matchScore: 72, status: 'rejected', appliedAt: '2024-06-12 15:30', experience: '2 năm', education: 'ĐH Bách Khoa HN', skills: ['Java', 'Spring Boot'], summary: 'Junior Backend Developer.' },
];

const statusOptions = [
  { value: 'new', label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'Đang xem xét', color: 'bg-amber-100 text-amber-700' },
  { value: 'interview', label: 'Phỏng vấn', color: 'bg-violet-100 text-violet-700' },
  { value: 'offer', label: 'Đề nghị', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'hired', label: 'Đã tuyển', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Từ chối', color: 'bg-red-100 text-red-700' },
];

export function RecruiterCandidates({ onNavigate, onLogout }: RecruiterCandidatesProps) {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const jobs = [...new Set(candidates.map(c => c.appliedJob))];
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter === 'all' || c.appliedJob === jobFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesJob && matchesStatus;
  });

  const handleViewProfile = (candidate: typeof mockCandidates[0]) => { setSelectedCandidate(candidate); setIsProfileOpen(true); };
  const handleStatusChange = (candidateId: number, newStatus: string) => { setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)); };

  const getStatusBadge = (status: string) => { const option = statusOptions.find(o => o.value === status); return option ? <Badge className={option.color}>{option.label}</Badge> : null; };
  const getMatchScoreColor = (score: number) => { if (score >= 90) return 'text-emerald-600 bg-emerald-50'; if (score >= 80) return 'text-blue-600 bg-blue-50'; if (score >= 70) return 'text-amber-600 bg-amber-50'; return 'text-red-600 bg-red-50'; };

  const stats = { total: candidates.length, new: candidates.filter(c => c.status === 'new').length, interview: candidates.filter(c => c.status === 'interview').length, hired: candidates.filter(c => c.status === 'hired').length };

  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterNavigation currentPage="recruiter-candidates" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={stats.new} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900">Quản lý ứng viên</h1><p className="text-slate-500 mt-1">Theo dõi và quản lý các ứng viên ứng tuyển</p></div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-100"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.total}</p><p className="text-sm text-slate-500">Tổng ứng viên</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-cyan-100"><Clock className="w-5 h-5 text-cyan-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.new}</p><p className="text-sm text-slate-500">Mới ứng tuyển</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-violet-100"><Briefcase className="w-5 h-5 text-violet-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.interview}</p><p className="text-sm text-slate-500">Đang phỏng vấn</p></div></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-emerald-100"><Star className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.hired}</p><p className="text-sm text-slate-500">Đã tuyển</p></div></CardContent></Card>
        </div>

        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
              <Select value={jobFilter} onValueChange={setJobFilter}><SelectTrigger className="w-56"><SelectValue placeholder="Vị trí ứng tuyển" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả vị trí</SelectItem>{jobs.map(job => (<SelectItem key={job} value={job}>{job}</SelectItem>))}</SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem>{statusOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow className="bg-slate-50"><TableHead className="font-semibold">Ứng viên</TableHead><TableHead className="font-semibold">Vị trí ứng tuyển</TableHead><TableHead className="font-semibold">Match Score</TableHead><TableHead className="font-semibold">Trạng thái</TableHead><TableHead className="font-semibold">Ngày ứng tuyển</TableHead><TableHead className="font-semibold text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-slate-50">
                    <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">{candidate.name.charAt(0)}</div><div><p className="font-medium">{candidate.name}</p><p className="text-xs text-slate-500">{candidate.email}</p></div></div></TableCell>
                    <TableCell><span className="flex items-center gap-1 text-slate-600"><Briefcase className="w-4 h-4" /> {candidate.appliedJob}</span></TableCell>
                    <TableCell><div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(candidate.matchScore)}`}><Star className="w-3 h-3" />{candidate.matchScore}%</div></TableCell>
                    <TableCell><Select value={candidate.status} onValueChange={(value) => handleStatusChange(candidate.id, value)}><SelectTrigger className="w-36 h-8">{getStatusBadge(candidate.status)}</SelectTrigger><SelectContent>{statusOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></TableCell>
                    <TableCell className="text-slate-500">{candidate.appliedAt}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => handleViewProfile(candidate)}><Eye className="w-4 h-4 mr-1" /> Xem hồ sơ</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Hồ sơ ứng viên</DialogTitle></DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">{selectedCandidate.name.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2><div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(selectedCandidate.matchScore)}`}>{selectedCandidate.matchScore}% Match</div></div>
                    <div className="flex items-center gap-4 mt-2 text-slate-500"><span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedCandidate.email}</span><span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedCandidate.phone}</span></div>
                    <div className="flex items-center gap-4 mt-1 text-slate-500"><span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedCandidate.location}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between"><div><p className="text-sm text-blue-600 font-medium">Ứng tuyển vị trí</p><p className="text-lg font-bold text-blue-900">{selectedCandidate.appliedJob}</p></div><div className="flex items-center gap-2 text-sm text-blue-600"><Calendar className="w-4 h-4" />{selectedCandidate.appliedAt}</div></div>
                </div>

                <div><h3 className="font-semibold text-slate-900 mb-2">Giới thiệu</h3><p className="text-slate-600">{selectedCandidate.summary}</p></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50"><div className="flex items-center gap-2 text-slate-500 mb-1"><Briefcase className="w-4 h-4" /><span className="text-sm">Kinh nghiệm</span></div><p className="font-semibold text-slate-900">{selectedCandidate.experience}</p></div>
                  <div className="p-4 rounded-lg bg-slate-50"><div className="flex items-center gap-2 text-slate-500 mb-1"><GraduationCap className="w-4 h-4" /><span className="text-sm">Học vấn</span></div><p className="font-semibold text-slate-900">{selectedCandidate.education}</p></div>
                </div>

                <div><h3 className="font-semibold text-slate-900 mb-2">Kỹ năng</h3><div className="flex flex-wrap gap-2">{selectedCandidate.skills.map((skill, idx) => (<Badge key={idx} variant="secondary" className="px-3 py-1">{skill}</Badge>))}</div></div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Trạng thái:</span>
                    <Select value={selectedCandidate.status} onValueChange={(value) => { handleStatusChange(selectedCandidate.id, value); setSelectedCandidate({ ...selectedCandidate, status: value }); }}><SelectTrigger className="w-40">{getStatusBadge(selectedCandidate.status)}</SelectTrigger><SelectContent>{statusOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
                  </div>
                  <div className="flex gap-2"><Button variant="outline"><Download className="w-4 h-4 mr-2" />Tải CV</Button><Button variant="outline"><Mail className="w-4 h-4 mr-2" />Gửi email</Button></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
