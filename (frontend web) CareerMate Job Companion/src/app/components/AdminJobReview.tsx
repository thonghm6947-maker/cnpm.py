import { useState, useEffect } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { FileCheck, Clock, CheckCircle, XCircle, Eye, Building2, MapPin, DollarSign, Calendar, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import type { Page } from '../App';
import { adminAPI } from '../../services/api';

interface AdminJobReviewProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

interface Job {
    id: number;
    title: string;
    company: string;
    recruiter: string;
    location: string;
    salary: string;
    status: string;
    submittedAt: string;
    description: string;
    requirements: string;
    rejectReason?: string;
}

export function AdminJobReview({ onNavigate, onLogout }: AdminJobReviewProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching jobs...');

            // Helper to safe extract jobs array from API response
            const extractJobs = (result: any) => {
                if (Array.isArray(result)) return result;
                if (result && Array.isArray(result.jobs)) return result.jobs;
                if (result && Array.isArray(result.data)) return result.data;
                return [];
            };

            // Fetch parallel but handle errors individually
            const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
                adminAPI.getJobsByStatus('pending'),
                adminAPI.getJobsByStatus('approved'),
                adminAPI.getJobsByStatus('rejected')
            ]);

            const pendingData = pendingRes.status === 'fulfilled' ? extractJobs(pendingRes.value) : [];
            const approvedData = approvedRes.status === 'fulfilled' ? extractJobs(approvedRes.value) : [];
            const rejectedData = rejectedRes.status === 'fulfilled' ? extractJobs(rejectedRes.value) : [];

            console.log('Jobs fetched:', { pending: pendingData.length, approved: approvedData.length, rejected: rejectedData.length });

            const mapJob = (job: any): Job => ({
                id: job.id || job.job_id,
                title: job.title,
                company: job.company || job.recruiter?.company || 'Unknown Company',
                recruiter: job.recruiter_name || job.recruiter?.full_name || job.recruiter || 'Unknown',
                location: job.location || 'Remote',
                salary: job.salary_range || job.salary || 'Thỏa thuận',
                status: String(job.status || 'draft').toLowerCase(), // Normalize status to lowercase
                submittedAt: job.submitted_at || job.created_at || new Date().toISOString(),
                description: job.description || '',
                requirements: job.requirements || '',
                rejectReason: job.reject_reason || job.reject_reason_text || job.rejectReason
            });

            const allJobs: Job[] = [
                ...pendingData.map(mapJob),
                ...approvedData.map(mapJob),
                ...rejectedData.map(mapJob)
            ];

            // Filter out duplicates if any (just in case)
            const uniqueJobs = Array.from(new Map(allJobs.map(item => [item.id, item])).values());

            console.log('Total unique jobs processed:', uniqueJobs.length);
            console.log('First job status:', uniqueJobs[0]?.status); // Debug log
            setJobs(uniqueJobs);

        } catch (err) {
            setError('Cannot load job list. Please try again later.');
            console.error('Error fetching jobs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const approvedJobs = jobs.filter(j => j.status === 'approved');
    const rejectedJobs = jobs.filter(j => j.status === 'rejected');
    const filteredJobs = activeTab === 'pending' ? pendingJobs : activeTab === 'approved' ? approvedJobs : rejectedJobs;

    const handlePreview = (job: Job) => {
        setSelectedJob(job);
        setIsPreviewOpen(true);
    };

    const handleApprove = async (jobId: number) => {
        setIsProcessing(true);
        setError(null);

        try {
            const result = await adminAPI.approveJob(jobId);
            if (result.error) {
                setError(result.error);
            } else {
                // Update local state
                setJobs(jobs.map(job => job.id === jobId ? { ...job, status: 'approved' } : job));
                setIsPreviewOpen(false);
            }
        } catch (err) {
            setError('Error approving job. Please try again.');
            console.error('Error approving job:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = (job: Job) => {
        setSelectedJob(job);
        setRejectReason('');
        setIsRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedJob || !rejectReason.trim()) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await adminAPI.rejectJob(selectedJob.id, rejectReason);
            if (result.error) {
                setError(result.error);
            } else {
                // Update local state
                setJobs(jobs.map(job => job.id === selectedJob.id ? { ...job, status: 'rejected', rejectReason } : job));
                setIsRejectDialogOpen(false);
                setIsPreviewOpen(false);
            }
        } catch (err) {
            setError('Error rejecting job. Please try again.');
            console.error('Error rejecting job:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        if (status === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
        return null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AdminNavigation currentPage="admin-jobs" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={0} />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-500">Loading job posts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminNavigation currentPage="admin-jobs" onNavigate={onNavigate} onLogout={onLogout} pendingJobsCount={pendingJobs.length} />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Job Post Approval</h1>
                    <p className="text-slate-500 mt-1">Review and approve job posts from Recruiters</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Close</Button>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className={`border-0 shadow-md cursor-pointer transition-all ${activeTab === 'pending' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setActiveTab('pending')}><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold text-slate-900">{pendingJobs.length}</p><p className="text-sm text-slate-500">Pending</p></div></CardContent></Card>
                    <Card className={`border-0 shadow-md cursor-pointer transition-all ${activeTab === 'approved' ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setActiveTab('approved')}><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-emerald-100"><CheckCircle className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-slate-900">{approvedJobs.length}</p><p className="text-sm text-slate-500">Approved</p></div></CardContent></Card>
                    <Card className={`border-0 shadow-md cursor-pointer transition-all ${activeTab === 'rejected' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setActiveTab('rejected')}><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-red-100"><XCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-slate-900">{rejectedJobs.length}</p><p className="text-sm text-slate-500">Rejected</p></div></CardContent></Card>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        {filteredJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <FileCheck className="w-12 h-12 mb-4 text-slate-300" />
                                <p className="text-lg font-medium">
                                    {activeTab === 'pending' ? 'No pending jobs' :
                                        activeTab === 'approved' ? 'No approved jobs' :
                                            'No rejected jobs'}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow className="bg-slate-50"><TableHead className="font-semibold">Position</TableHead><TableHead className="font-semibold">Company</TableHead><TableHead className="font-semibold">Location</TableHead><TableHead className="font-semibold">Salary</TableHead><TableHead className="font-semibold">Status</TableHead><TableHead className="font-semibold">Submitted Date</TableHead><TableHead className="font-semibold text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="hover:bg-slate-50">
                                            <TableCell><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600"><Briefcase className="w-4 h-4 text-white" /></div><div><p className="font-medium">{job.title}</p><p className="text-xs text-slate-500">by {job.recruiter}</p></div></div></TableCell>
                                            <TableCell><div className="flex items-center gap-2 text-slate-600"><Building2 className="w-4 h-4" />{job.company}</div></TableCell>
                                            <TableCell><div className="flex items-center gap-2 text-slate-500"><MapPin className="w-4 h-4" />{job.location}</div></TableCell>
                                            <TableCell><div className="flex items-center gap-2 text-slate-500"><DollarSign className="w-4 h-4" />{job.salary}</div></TableCell>
                                            <TableCell>{getStatusBadge(job.status)}</TableCell>
                                            <TableCell className="text-slate-500">{formatDateTime(job.submittedAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handlePreview(job)}><Eye className="w-4 h-4" /></Button>
                                                    {job.status === 'pending' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleApprove(job.id)} disabled={isProcessing}>
                                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRejectClick(job)} disabled={isProcessing}>
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </>
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

                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500" />Preview Job Post</DialogTitle></DialogHeader>
                        {selectedJob && (
                            <div className="space-y-6 py-4">
                                <div><h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2><div className="flex items-center gap-4 mt-2 text-slate-500"><span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {selectedJob.company}</span><span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span></div></div>
                                <div className="flex items-center gap-4"><div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700"><DollarSign className="w-4 h-4" /><span className="font-medium">{selectedJob.salary}</span></div>{getStatusBadge(selectedJob.status)}</div>
                                <div><h3 className="font-semibold text-slate-900 mb-2">Job Description</h3><p className="text-slate-600 whitespace-pre-line">{selectedJob.description}</p></div>
                                <div><h3 className="font-semibold text-slate-900 mb-2">Requirements</h3><p className="text-slate-600 whitespace-pre-line">{selectedJob.requirements}</p></div>
                                {selectedJob.status === 'rejected' && selectedJob.rejectReason && (<div className="p-4 rounded-lg bg-red-50 border border-red-200"><h3 className="font-semibold text-red-800 mb-1">Rejection Reason</h3><p className="text-red-700">{selectedJob.rejectReason}</p></div>)}
                                <div className="text-sm text-slate-400"><div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Submitted: {formatDateTime(selectedJob.submittedAt)}</div><div className="mt-1">Submitted by: {selectedJob.recruiter}</div></div>
                            </div>
                        )}
                        {selectedJob?.status === 'pending' && (
                            <DialogFooter>
                                <Button variant="outline" onClick={() => handleRejectClick(selectedJob)} disabled={isProcessing}>
                                    <XCircle className="w-4 h-4 mr-2" />Reject
                                </Button>
                                <Button onClick={() => handleApprove(selectedJob.id)} className="bg-emerald-600 hover:bg-emerald-700" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}Approve
                                </Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Reject Job Post</DialogTitle><DialogDescription>Please enter the rejection reason to notify the Recruiter.</DialogDescription></DialogHeader>
                        <div className="py-4"><Textarea placeholder="Enter rejection reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} /></div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleRejectConfirm} disabled={!rejectReason.trim() || isProcessing} className="bg-red-600 hover:bg-red-700">
                                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Confirm Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
