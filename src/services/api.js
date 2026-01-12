// src/services/api.js
const API_BASE = 'http://localhost:9999';

// Auth helpers
let inMemoryToken = null;

export const setToken = (token) => {
    inMemoryToken = token;
    localStorage.setItem('access_token', token);
};

export const getToken = () => {
    const t = inMemoryToken || localStorage.getItem('access_token');
    return t ? t.trim() : null;
};

export const removeToken = () => {
    inMemoryToken = null;
    localStorage.removeItem('access_token');
};

// Helper for authenticated requests
const authHeaders = () => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    console.log('Sending Auth Header:', headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'MISSING');
    return headers;
};

const handleResponse = async (res) => {
    if (res.status === 401) {
        const token = getToken();
        const hasToken = !!token;
        // Keep a discreet log for troubleshooting
        console.error(`API 401 Unauthorized. Token present: ${hasToken}`);

        removeToken();

        // Auto-redirect to login/landing on 401
        window.location.href = '/';

        return {
            success: false,
            message: 'Session expired or invalid. Please login again.'
        };
    }
    return res.json();
};

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

        // Handle potential double-encoded JSON
        let data = await res.json();
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { }
        }

        // Support both access_token (standard) and token (alternative) keys
        const token = data.access_token || data.token;
        if (token) setToken(token);

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

// ============ AI API ============
export const aiAPI = {
    // Health check (no auth required)
    health: async () => {
        const res = await fetch(`${API_BASE}/api/ai/health`);
        return res.json();
    },

    // CV Analyzer
    /**
     * @param {string} cv_text 
     * @param {string|null} [job_description] 
     * @param {string|null} [target_role] 
     */
    analyzeCV: async (cv_text, job_description = null, target_role = null) => {
        const body = { cv_text };
        if (job_description) body.job_description = job_description;
        if (target_role) body.target_role = target_role;

        const res = await fetch(`${API_BASE}/api/ai/cv-analyze`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },

    /**
     * @param {string} cv_text 
     * @param {string} target_role 
     */
    improveCV: async (cv_text, target_role) => {
        const res = await fetch(`${API_BASE}/api/ai/cv-improve`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ cv_text, target_role })
        });
        return handleResponse(res);
    },

    // Career Coach
    /**
     * @param {string} message 
     * @param {number|null} [session_id] 
     * @param {string|null} [topic] 
     */
    sendMessage: async (message, session_id = null, topic = null) => {
        const body = { message };
        if (session_id) body.session_id = session_id;
        if (topic) body.topic = topic;

        const res = await fetch(`${API_BASE}/api/ai/career-coach`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },

    getChatSessions: async () => {
        const res = await fetch(`${API_BASE}/api/ai/chat-sessions`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    getSessionMessages: async (session_id) => {
        const res = await fetch(`${API_BASE}/api/ai/chat-sessions/${session_id}/messages`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    deleteSession: async (session_id) => {
        const res = await fetch(`${API_BASE}/api/ai/chat-sessions/${session_id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    // Career Roadmap
    /**
     * @param {string} target_role 
     * @param {string|null} [current_role] 
     * @param {string[]} [current_skills] 
     * @param {string|null} [time_frame] 
     */
    createRoadmap: async (target_role, current_role = null, current_skills = [], time_frame = null) => {
        const body = { target_role };
        if (current_role) body.current_role = current_role;
        if (current_skills.length > 0) body.current_skills = current_skills;
        if (time_frame) body.time_frame = time_frame;

        const res = await fetch(`${API_BASE}/api/ai/career-roadmap`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },

    getRoadmaps: async () => {
        const res = await fetch(`${API_BASE}/api/ai/career-roadmaps`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    deleteRoadmap: async (roadmap_id) => {
        const res = await fetch(`${API_BASE}/api/ai/career-roadmaps/${roadmap_id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    }
};