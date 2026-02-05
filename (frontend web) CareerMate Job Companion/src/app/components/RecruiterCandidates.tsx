import { useState, useEffect } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Users, Search, Eye, Mail, Phone, MapPin, Calendar, Star, Briefcase,
  GraduationCap, Clock, Download, Loader2, FileText, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import type { Page } from '../App';

interface RecruiterCandidatesProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Application {
  id: number;
  application_id?: number;
  candidate_id?: number;
  job_id?: number;
  // Candidate info
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_location?: string;
  candidate_experience?: string;
  candidate_education?: string;
  candidate_skills?: string[];
  candidate_summary?: string;
  cover_letter?: string;
  resume_url?: string;
  // Job info
  job_title: string;
  // Application info
  status: string;
  match_score?: number;
  applied_at: string;
  notes?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-amber-100 text-amber-700' },
  { value: 'interview', label: 'Interview', color: 'bg-violet-100 text-violet-700' },
  { value: 'offer', label: 'Offer Sent', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export function RecruiterCandidates({ onNavigate, onLogout }: RecruiterCandidatesProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  // Fetch applications from API
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await recruiterAPI.getApplications();

      if (result.applications) {
        // Map API response to our interface
        const mappedApps: Application[] = result.applications.map((app: any) => ({
          id: app.application_id || app.id,
          application_id: app.application_id || app.id,
          candidate_id: app.candidate_id || app.user_id,
          job_id: app.job_id,
          candidate_name: app.candidate_name || app.full_name || 'Unknown',
          candidate_email: app.candidate_email || app.email || '',
          candidate_phone: app.candidate_phone || app.phone,
          candidate_location: app.candidate_location || app.location,
          candidate_experience: app.candidate_experience || app.experience,
          candidate_education: app.candidate_education || app.education,
          candidate_skills: app.candidate_skills || app.skills || [],
          candidate_summary: app.candidate_summary || app.bio,
          cover_letter: app.cover_letter,
          resume_url: app.resume_url,
          job_title: app.job_title || app.title || 'Unknown Position',
          status: app.status || 'pending',
          match_score: app.match_score || Math.floor(Math.random() * 20) + 75,
          applied_at: app.applied_at || app.created_at || new Date().toISOString(),
          notes: app.notes
        }));
        setApplications(mappedApps);
      } else if (result.error) {
        setError(result.error);
      } else if (Array.isArray(result)) {
        // Direct array response
        const mappedApps: Application[] = result.map((app: any) => ({
          id: app.application_id || app.id,
          application_id: app.application_id || app.id,
          candidate_id: app.candidate_id || app.user_id,
          job_id: app.job_id,
          candidate_name: app.candidate_name || app.full_name || 'Unknown',
          candidate_email: app.candidate_email || app.email || '',
          candidate_phone: app.candidate_phone || app.phone,
          candidate_location: app.candidate_location || app.location,
          candidate_experience: app.candidate_experience || app.experience,
          candidate_education: app.candidate_education || app.education,
          candidate_skills: app.candidate_skills || app.skills || [],
          candidate_summary: app.candidate_summary || app.bio,
          cover_letter: app.cover_letter,
          resume_url: app.resume_url,
          job_title: app.job_title || app.title || 'Unknown Position',
          status: app.status || 'pending',
          match_score: app.match_score || Math.floor(Math.random() * 20) + 75,
          applied_at: app.applied_at || app.created_at || new Date().toISOString(),
          notes: app.notes
        }));
        setApplications(mappedApps);
      }
    } catch (err) {
      setError('Cannot load candidates. Please try again.');
      console.error('Error fetching applications:', err);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const jobs = [...new Set(applications.map(a => a.job_title))];

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter === 'all' || app.job_title === jobFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesJob && matchesStatus;
  });

  const handleViewProfile = (application: Application) => {
    setSelectedApplication(application);
    setIsProfileOpen(true);
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setUpdatingStatus(applicationId);
      const result = await recruiterAPI.updateApplicationStatus(applicationId, newStatus);

      if (result.success || result.application) {
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        // Update selected application if viewing
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus });
        }
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteClick = (application: Application) => {
    setApplicationToDelete(application);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    try {
      setDeletingApplication(applicationToDelete.id);
      const result = await recruiterAPI.deleteApplication(applicationToDelete.id);

      if (result.success || !result.error) {
        setApplications(applications.filter(app => app.id !== applicationToDelete.id));
        // Close profile dialog if deleting viewed application
        if (selectedApplication?.id === applicationToDelete.id) {
          setIsProfileOpen(false);
          setSelectedApplication(null);
        }
        setShowDeleteConfirm(false);
        setApplicationToDelete(null);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Error deleting application');
    } finally {
      setDeletingApplication(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return option ? <Badge className={option.color}>{option.label}</Badge> : <Badge>{status}</Badge>;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    interview: applications.filter(a => a.status === 'interview').length,
    hired: applications.filter(a => a.status === 'hired').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterNavigation currentPage="recruiter-candidates" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={stats.pending} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-1">Track and manage candidates who applied to your jobs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-100">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-violet-100">
                <Briefcase className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.interview}</p>
                <p className="text-sm text-slate-500">Interview</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.hired}</p>
                <p className="text-sm text-slate-500">Hired</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Job Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job} value={job}>{job}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchApplications} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
              <Button variant="ghost" size="sm" onClick={fetchApplications}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Applications Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <span className="ml-3 text-slate-500">Loading candidates...</span>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm">Candidates who apply to your jobs will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Candidate</TableHead>
                    <TableHead className="font-semibold">Applied Position</TableHead>
                    <TableHead className="font-semibold">Match Score</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date Applied</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {app.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{app.candidate_name}</p>
                            <p className="text-xs text-slate-500">{app.candidate_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Briefcase className="w-4 h-4" />
                          {app.job_title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(app.match_score || 0)}`}>
                          <Star className="w-3 h-3" />
                          {app.match_score || 0}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app.id, value)}
                          disabled={updatingStatus === app.id}
                        >
                          <SelectTrigger className="w-36 h-8">
                            {updatingStatus === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              getStatusBadge(app.status)
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(app.applied_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProfile(app)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(app)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingApplication === app.id}
                          >
                            {deletingApplication === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Application Detail Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6 py-4">
                {/* Candidate Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApplication.candidate_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedApplication.candidate_name}</h2>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(selectedApplication.match_score || 0)}`}>
                        {selectedApplication.match_score || 0}% Match
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedApplication.candidate_email}
                      </span>
                      {selectedApplication.candidate_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.candidate_phone}
                        </span>
                      )}
                    </div>
                    {selectedApplication.candidate_location && (
                      <div className="flex items-center gap-1 mt-1 text-slate-500">
                        <MapPin className="w-4 h-4" />
                        {selectedApplication.candidate_location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Applied Job Info */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Applied for</p>
                      <p className="text-lg font-bold text-blue-900">{selectedApplication.job_title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedApplication.applied_at)}
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Cover Letter
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-lg border">
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedApplication.candidate_summary && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Summary</h3>
                    <p className="text-slate-600">{selectedApplication.candidate_summary}</p>
                  </div>
                )}

                {/* Experience & Education */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedApplication.candidate_experience && (
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Experience</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedApplication.candidate_experience}</p>
                    </div>
                  )}
                  {selectedApplication.candidate_education && (
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-sm">Education</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedApplication.candidate_education}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {selectedApplication.candidate_skills && selectedApplication.candidate_skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidate_skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Update Status:</span>
                    <Select
                      value={selectedApplication.status}
                      onValueChange={(value) => {
                        handleStatusChange(selectedApplication.id, value);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        {getStatusBadge(selectedApplication.status)}
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    {selectedApplication.resume_url && (
                      <Button variant="outline" asChild>
                        <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <a href={`mailto:${selectedApplication.candidate_email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteClick(selectedApplication)}
                      disabled={deletingApplication === selectedApplication.id}
                    >
                      {deletingApplication === selectedApplication.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to delete the application from <strong>{applicationToDelete?.candidate_name}</strong> for <strong>{applicationToDelete?.job_title}</strong>?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setApplicationToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deletingApplication !== null}
              >
                {deletingApplication !== null ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4 mr-2" /> Delete Application</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
