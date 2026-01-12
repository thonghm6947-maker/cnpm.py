import { useState, useEffect } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Briefcase, Plus, Eye, Edit, Send, Users, Clock, CheckCircle, XCircle, MapPin, DollarSign, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import type { Page } from '../App';
import { recruiterAPI } from '../../services/api';

interface RecruiterJobManagementProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

interface Job {
    id: number;
    title: string;
    location: string;
    salary: string;
    type: string;
    status: string;
    applications: number;
    createdAt: string;
    description: string;
    requirements: string;
    rejectReason?: string;
}

const emptyJob: Job = {
    id: 0,
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
    status: 'draft',
    applications: 0,
    createdAt: new Date().toISOString().split('T')[0],
    description: '',
    requirements: ''
};

export function RecruiterJobManagement({ onNavigate, onLogout }: RecruiterJobManagementProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'draft' | 'rejected'>('all');

    // Fetch jobs on mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await recruiterAPI.getMyJobs();
            if (result.jobs) {
                const mappedJobs: Job[] = result.jobs.map((job: any) => ({
                    id: job.id || job.job_id,
                    title: job.title,
                    location: job.location || 'Remote',
                    salary: job.salary_range || job.salary || 'Thỏa thuận',
                    type: job.job_type || job.type || 'Full-time',
                    status: job.status || 'draft',
                    applications: job.application_count || job.applications || 0,
                    createdAt: job.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    description: job.description || '',
                    requirements: job.requirements || '',
                    rejectReason: job.reject_reason || job.rejectReason
                }));
                setJobs(mappedJobs);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại sau.');
            console.error('Error fetching jobs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        all: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        pending: jobs.filter(j => j.status === 'pending').length,
        draft: jobs.filter(j => j.status === 'draft').length,
        rejected: jobs.filter(j => j.status === 'rejected').length
    };
    const filteredJobs = activeTab === 'all' ? jobs : jobs.filter(j => j.status === activeTab);

    const handleCreateNew = () => {
        setEditingJob({ ...emptyJob, id: Date.now() });
        setIsDialogOpen(true);
    };

    const handleEdit = (job: Job) => {
        setEditingJob({ ...job });
        setIsDialogOpen(true);
    };

    const handlePreview = (job: Job) => {
        setSelectedJob(job);
        setIsPreviewOpen(true);
    };

    const handleSave = async (asDraft: boolean = true) => {
        if (!editingJob) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Always save as draft first (backend might ignore status: pending anyway)
            const jobData = {
                title: editingJob.title,
                location: editingJob.location,
                salary_range: editingJob.salary,
                job_type: editingJob.type,
                description: editingJob.description,
                requirements: editingJob.requirements,
                status: 'draft' // Always save as draft first
            };

            const existingJob = jobs.find(j => j.id === editingJob.id);
            let result;

            if (existingJob) {
                // Update existing job
                result = await recruiterAPI.updateJob(editingJob.id, jobData);
            } else {
                // Create new job
                result = await recruiterAPI.createJob(jobData);
            }

            if (result.error) {
                setError(result.error);
                setIsSaving(false);
            } else {
                // Get the job ID from result (for new jobs) or use existing
                const savedJobId = result.job?.id || result.job_id || editingJob.id;

                // If user wanted to submit (not draft), call submit endpoint now
                if (!asDraft) {
                    const submitResult = await recruiterAPI.submitForReview(savedJobId);
                    if (submitResult.error) {
                        setError('Lưu thành công nhưng gửi duyệt thất bại: ' + submitResult.error);
                        // Update local state as draft since submit failed
                        updateLocalJobs(savedJobId, 'draft', !!existingJob);
                    } else {
                        // Success submit
                        updateLocalJobs(savedJobId, 'pending', !!existingJob);
                        setSuccessMessage('Tin tuyển dụng đã được gửi duyệt thành công!');
                    }
                } else {
                    // Just draft
                    updateLocalJobs(savedJobId, 'draft', !!existingJob);
                    setSuccessMessage('Đã lưu bản nháp thành công!');
                }

                setIsDialogOpen(false);
                setEditingJob(null);
                setTimeout(() => setSuccessMessage(null), 5000);
            }
        } catch (err) {
            setError('Lỗi khi lưu tin tuyển dụng. Vui lòng thử lại.');
            console.error('Error saving job:', err);
        } finally {
            if (isSaving) setIsSaving(false); // Only turn off if not already handled
        }
    };

    const updateLocalJobs = (id: number, status: string, isExisting: boolean | undefined) => {
        if (isExisting) {
            setJobs(prev => prev.map(j =>
                j.id === id
                    ? { ...j, ...editingJob!, id: id, status: status }
                    : j
            ));
        } else {
            setJobs(prev => [{
                ...editingJob!,
                id: id,
                status: status,
                applications: 0,
                createdAt: new Date().toISOString().split('T')[0]
            }, ...prev]);
        }
    };

    const handleSubmitForReview = async (jobId: number) => {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await recruiterAPI.submitForReview(jobId);
            if (result.error) {
                setError(result.error);
            } else {
                // Update local state immediately for better UX
                setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: 'pending' } : j));

                // Show success message
                setSuccessMessage('Tin tuyển dụng đã được gửi duyệt thành công!');
                setTimeout(() => setSuccessMessage(null), 5000);
            }
        } catch (err) {
            setError('Lỗi khi gửi duyệt. Vui lòng thử lại.');
            console.error('Error submitting job:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (job: Job) => {
        setJobToDelete(job);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!jobToDelete) return;

        setIsSaving(true);
        setError(null);

        try {
            const result = await recruiterAPI.deleteJob(jobToDelete.id);
            if (result.error) {
                setError(result.error);
            } else {
                setJobs(jobs.filter(j => j.id !== jobToDelete.id));
                setIsDeleteDialogOpen(false);
                setJobToDelete(null);
            }
        } catch (err) {
            setError('Lỗi khi xóa tin tuyển dụng. Vui lòng thử lại.');
            console.error('Error deleting job:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Đang tuyển</Badge>;
        if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
        if (status === 'draft') return <Badge className="bg-slate-100 text-slate-700"><Edit className="w-3 h-3 mr-1" />Bản nháp</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <RecruiterNavigation currentPage="recruiter-jobs" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={23} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div><h1 className="text-3xl font-bold text-slate-900">Quản lý tin tuyển dụng</h1><p className="text-slate-500 mt-1">Tạo và quản lý các tin tuyển dụng của bạn</p></div>
                    <Button onClick={handleCreateNew} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"><Plus className="w-4 h-4 mr-2" />Tạo tin mới</Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Đóng</Button>
                    </div>
                )}

                {/* Success message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-700">
                        <CheckCircle className="w-5 h-5" />
                        <span>{successMessage}</span>
                        <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)} className="ml-auto">Đóng</Button>
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    {[{ key: 'all', label: 'Tất cả', count: stats.all }, { key: 'active', label: 'Đang tuyển', count: stats.active }, { key: 'pending', label: 'Chờ duyệt', count: stats.pending }, { key: 'draft', label: 'Bản nháp', count: stats.draft }, { key: 'rejected', label: 'Bị từ chối', count: stats.rejected }].map((tab) => (
                        <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'outline'} onClick={() => setActiveTab(tab.key as any)} className="gap-2">{tab.label}<Badge variant="secondary" className="ml-1">{tab.count}</Badge></Button>
                    ))}
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <span className="ml-3 text-slate-500">Đang tải danh sách tin tuyển dụng...</span>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Briefcase className="w-12 h-12 mb-4 text-slate-300" />
                                <p className="text-lg font-medium">Chưa có tin tuyển dụng nào</p>
                                <p className="text-sm">Bấm "Tạo tin mới" để bắt đầu</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow className="bg-slate-50"><TableHead className="font-semibold">Vị trí</TableHead><TableHead className="font-semibold">Địa điểm</TableHead><TableHead className="font-semibold">Mức lương</TableHead><TableHead className="font-semibold">Trạng thái</TableHead><TableHead className="font-semibold">Ứng viên</TableHead><TableHead className="font-semibold">Ngày tạo</TableHead><TableHead className="font-semibold text-right">Thao tác</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="hover:bg-slate-50">
                                            <TableCell><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500"><Briefcase className="w-4 h-4 text-white" /></div><div><p className="font-medium">{job.title}</p><p className="text-xs text-slate-500">{job.type}</p></div></div></TableCell>
                                            <TableCell><span className="flex items-center gap-1 text-slate-500"><MapPin className="w-4 h-4" /> {job.location}</span></TableCell>
                                            <TableCell><span className="flex items-center gap-1 text-slate-500"><DollarSign className="w-4 h-4" /> {job.salary}</span></TableCell>
                                            <TableCell>{getStatusBadge(job.status)}</TableCell>
                                            <TableCell><span className="flex items-center gap-1 text-slate-500"><Users className="w-4 h-4" /> {job.applications}</span></TableCell>
                                            <TableCell className="text-slate-500">{job.createdAt}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handlePreview(job)}><Eye className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(job)}><Edit className="w-4 h-4" /></Button>
                                                    {['draft', 'pending', 'rejected'].includes(job.status) && (
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(job)} disabled={isSaving}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {job.status === 'draft' && (
                                                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleSubmitForReview(job.id)} disabled={isSaving}>
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingJob?.id && jobs.find(j => j.id === editingJob.id) ? 'Chỉnh sửa tin' : 'Tạo tin tuyển dụng mới'}</DialogTitle></DialogHeader>
                        {editingJob && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2"><label className="text-sm font-medium">Tiêu đề vị trí *</label><Input placeholder="VD: Senior Frontend Developer" value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-sm font-medium">Địa điểm *</label><Input placeholder="VD: Hồ Chí Minh" value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium">Mức lương *</label><Input placeholder="VD: 20-30 triệu VNĐ" value={editingJob.salary} onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })} /></div>
                                </div>
                                <div className="space-y-2"><label className="text-sm font-medium">Loại hình công việc</label><Select value={editingJob.type} onValueChange={(value) => setEditingJob({ ...editingJob, type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Remote">Remote</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Mô tả công việc *</label><Textarea placeholder="Mô tả chi tiết về vị trí công việc..." value={editingJob.description} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} rows={4} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Yêu cầu ứng viên *</label><Textarea placeholder="- Kinh nghiệm yêu cầu..." value={editingJob.requirements} onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })} rows={4} /></div>
                            </div>
                        )}
                        <DialogFooter className="gap-2 sm:justify-between">
                            {editingJob && jobs.find(j => j.id === editingJob.id) && (
                                <Button
                                    variant="destructive"
                                    className="mr-auto bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                    onClick={() => {
                                        const job = jobs.find(j => j.id === editingJob.id);
                                        if (job) {
                                            setJobToDelete(job);
                                            setIsDeleteDialogOpen(true);
                                            setIsDialogOpen(false);
                                        }
                                    }}
                                    disabled={isSaving}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
                                <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Lưu bản nháp
                                </Button>
                                <Button onClick={() => handleSave(false)} className="bg-gradient-to-r from-blue-500 to-blue-600" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}Gửi duyệt
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500" />Xem trước tin tuyển dụng</DialogTitle></DialogHeader>
                        {selectedJob && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>{getStatusBadge(selectedJob.status)}</div>
                                <div className="flex items-center gap-4 text-slate-500"><span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span><span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {selectedJob.salary}</span><Badge variant="secondary">{selectedJob.type}</Badge></div>
                                <div><h3 className="font-semibold text-slate-900 mb-2">Mô tả công việc</h3><p className="text-slate-600 whitespace-pre-line">{selectedJob.description}</p></div>
                                <div><h3 className="font-semibold text-slate-900 mb-2">Yêu cầu</h3><p className="text-slate-600 whitespace-pre-line">{selectedJob.requirements}</p></div>
                                {selectedJob.status === 'rejected' && selectedJob.rejectReason && (<div className="p-4 rounded-lg bg-red-50 border border-red-200"><h3 className="font-semibold text-red-800 mb-1">Lý do từ chối</h3><p className="text-red-700">{selectedJob.rejectReason}</p></div>)}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xóa tin tuyển dụng</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-600">
                                Bạn có chắc chắn muốn xóa tin tuyển dụng <strong>{jobToDelete?.title}</strong> không?
                                <br />
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>Hủy</Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteConfirm} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}Xóa
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
