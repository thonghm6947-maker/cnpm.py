// src/services/api.js
const API_BASE = 'http://localhost:9999';

// Token management
export const setToken = (token) => localStorage.setItem('access_token', token);
export const getToken = () => localStorage.getItem('access_token');
export const removeToken = () => localStorage.removeItem('access_token');

// Helper for authenticated requests
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// ============ Auth API ============
export const authAPI = {
    register: async ({ email, password, password_confirm, role, full_name, phone }) => {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, password_confirm, role, full_name, phone })
        });
        return res.json();
    },

    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.access_token) setToken(data.access_token);
        return data;
    },

    logout: () => removeToken(),

    getMe: async () => {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: authHeaders()
        });
        return res.json();
    }
};

// ============ Jobs API ============
export const jobAPI = {
    list: async (page = 1, perPage = 10, search = '', location = '') => {
        const params = new URLSearchParams({ page, per_page: perPage, search, location });
        const res = await fetch(`${API_BASE}/api/jobs?${params}`);
        return res.json();
    },

    get: async (jobId) => {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
        return res.json();
    },

    create: async (jobData) => {
        const res = await fetch(`${API_BASE}/api/jobs`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(jobData)
        });
        return res.json();
    },

    apply: async (jobId, resumeId, coverLetter) => {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ resume_id: resumeId, cover_letter: coverLetter })
        });
        return res.json();
    },

    getMyApplications: async () => {
        const res = await fetch(`${API_BASE}/api/jobs/applications`, {
            headers: authHeaders()
        });
        return res.json();
    },

    saveJob: async (jobId) => {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}/save`, {
            method: 'POST',
            headers: authHeaders()
        });
        return res.json();
    },

    getSavedJobs: async () => {
        const res = await fetch(`${API_BASE}/api/jobs/saved`, {
            headers: authHeaders()
        });
        return res.json();
    }
};

// ============ Profile API ============
export const profileAPI = {
    getCandidate: async () => {
        const res = await fetch(`${API_BASE}/api/profile/candidate`, {
            headers: authHeaders()
        });
        return res.json();
    },

    updateCandidate: async (data) => {
        const res = await fetch(`${API_BASE}/api/profile/candidate`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getRecruiter: async () => {
        const res = await fetch(`${API_BASE}/api/profile/recruiter`, {
            headers: authHeaders()
        });
        return res.json();
    },

    updateRecruiter: async (data) => {
        const res = await fetch(`${API_BASE}/api/profile/recruiter`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    }
};

// ============ Recruiter API ============
export const recruiterAPI = {
    // Get recruiter's own jobs
    getMyJobs: async (status = '') => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        const res = await fetch(`${API_BASE}/api/recruiter/jobs?${params}`, {
            headers: authHeaders()
        });
        return res.json();
    },

    // Create a new job posting
    createJob: async (jobData) => {
        const res = await fetch(`${API_BASE}/api/recruiter/jobs`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(jobData)
        });
        return res.json();
    },

    // Update an existing job
    updateJob: async (jobId, jobData) => {
        const res = await fetch(`${API_BASE}/api/recruiter/jobs/${jobId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(jobData)
        });
        return res.json();
    },

    // Delete a job posting
    deleteJob: async (jobId) => {
        const res = await fetch(`${API_BASE}/api/recruiter/jobs/${jobId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return res.json();
    },

    // Submit job for review
    submitForReview: async (jobId) => {
        const res = await fetch(`${API_BASE}/api/recruiter/jobs/${jobId}/submit`, {
            method: 'POST',
            headers: authHeaders()
        });
        return res.json();
    },

    // Get applications for recruiter's jobs
    getApplications: async (jobId = null) => {
        const url = jobId
            ? `${API_BASE}/api/recruiter/jobs/${jobId}/applications`
            : `${API_BASE}/api/recruiter/applications`;
        const res = await fetch(url, {
            headers: authHeaders()
        });
        return res.json();
    },

    // Update application status
    updateApplicationStatus: async (applicationId, status, notes = '') => {
        const res = await fetch(`${API_BASE}/api/recruiter/applications/${applicationId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status, notes })
        });
        return res.json();
    },

    // Get dashboard stats
    getDashboardStats: async () => {
        const res = await fetch(`${API_BASE}/api/recruiter/dashboard`, {
            headers: authHeaders()
        });
        return res.json();
    }
};

// ============ Admin API ============
export const adminAPI = {
    // Get all pending jobs for review
    getPendingJobs: async () => {
        const res = await fetch(`${API_BASE}/api/admin/jobs?status=pending`, {
            headers: authHeaders()
        });
        return res.json();
    },

    // Get jobs by status
    getJobsByStatus: async (status) => {
        const res = await fetch(`${API_BASE}/api/admin/jobs?status=${status}`, {
            headers: authHeaders()
        });
        return res.json();
    },

    // Approve a job posting
    approveJob: async (jobId) => {
        const res = await fetch(`${API_BASE}/api/admin/jobs/${jobId}/approve`, {
            method: 'POST',
            headers: authHeaders()
        });
        return res.json();
    },

    // Reject a job posting with reason
    rejectJob: async (jobId, reason) => {
        const res = await fetch(`${API_BASE}/api/admin/jobs/${jobId}/reject`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ reason })
        });
        return res.json();
    },

    // Get all users
    getUsers: async (role = '') => {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
            headers: authHeaders()
        });
        return res.json();
    },

    // Get dashboard stats
    getDashboardStats: async () => {
        const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
            headers: authHeaders()
        });
        return res.json();
    }
};