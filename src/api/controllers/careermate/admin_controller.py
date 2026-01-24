from flask import Blueprint, request, jsonify
from api.controllers.careermate.auth_controller import token_required
from infrastructure.repositories.careermate.job_repository import JobRepository, ApplicationRepository
from infrastructure.repositories.careermate.user_repository import UserRepository
from infrastructure.models.careermate.job_post_model import JobStatus
from api.schemas.careermate_schemas import JobPostSchema, UserResponseSchema


# Create blueprint
cm_admin_bp = Blueprint('cm_admin', __name__, url_prefix='/api/admin')

# Schemas
job_schema = JobPostSchema()
jobs_schema = JobPostSchema(many=True)
user_schema = UserResponseSchema()
users_schema = UserResponseSchema(many=True)


def require_admin(f):
    """Decorator to require admin role."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = request.current_user
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


# ============ Admin Jobs Management ============
@cm_admin_bp.route('/jobs', methods=['GET'])
@token_required
@require_admin
def list_admin_jobs():
    """
    List jobs for admin with status filter
    ---
    get:
      summary: List all jobs with optional status filter
      tags:
        - Admin Jobs
      security:
        - BearerAuth: []
      parameters:
        - name: status
          in: query
          type: string
          enum: [pending, approved, rejected, open, closed, draft, paused]
      responses:
        200:
          description: List of jobs
    """
    status_filter = request.args.get('status')
    
    job_repo = JobRepository()
    
    if status_filter:
        try:
            # Handle both lowercase and uppercase status values
            status_enum = JobStatus(status_filter.upper()) if status_filter else None
            jobs = job_repo.get_by_status(status_enum)
        except ValueError:
            return jsonify({'error': f'Invalid status: {status_filter}'}), 400
    else:
        jobs = job_repo.get_all()
    
    return jsonify({
        'jobs': jobs_schema.dump(jobs)
    }), 200


@cm_admin_bp.route('/jobs/pending', methods=['GET'])
@token_required
@require_admin
def list_pending_jobs():
    """
    List all pending jobs for admin review
    ---
    get:
      summary: Get all jobs waiting for approval
      tags:
        - Admin Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of pending jobs
    """
    job_repo = JobRepository()
    pending_jobs = job_repo.get_by_status(JobStatus.PENDING)
    
    return jsonify({
        'jobs': jobs_schema.dump(pending_jobs),
        'count': len(pending_jobs) if pending_jobs else 0
    }), 200


@cm_admin_bp.route('/jobs/<int:job_id>/approve', methods=['POST'])
@token_required
@require_admin
def approve_job(job_id):
    """
    Approve a pending job
    ---
    post:
      summary: Approve a job post (change status to approved)
      tags:
        - Admin Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: Job approved
    """
    job_repo = JobRepository()
    job = job_repo.get_by_id(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    job.status = JobStatus.APPROVED
    job_repo.update(job)
    
    return jsonify({'message': 'Job approved successfully', 'job': job_schema.dump(job)}), 200


@cm_admin_bp.route('/jobs/<int:job_id>/reject', methods=['POST'])
@token_required
@require_admin
def reject_job(job_id):
    """
    Reject a pending job
    ---
    post:
      summary: Reject a job post
      tags:
        - Admin Jobs
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
      responses:
        200:
          description: Job rejected
    """
    job_repo = JobRepository()
    job = job_repo.get_by_id(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    data = request.get_json() or {}
    reason = data.get('reason', 'No reason provided')
    
    job.status = JobStatus.REJECTED

    job_repo.update(job)
    
    return jsonify({
        'message': 'Job rejected',
        'reason': reason,
        'job': job_schema.dump(job)
    }), 200


# ============ Admin Users Management ============
@cm_admin_bp.route('/users', methods=['GET'])
@token_required
@require_admin
def list_users():
    """
    List all users
    ---
    get:
      summary: List all users
      tags:
        - Admin Users
      security:
        - BearerAuth: []
      parameters:
        - name: role
          in: query
          type: string
          enum: [candidate, recruiter, admin]
      responses:
        200:
          description: List of users
    """
    role_filter = request.args.get('role')
    
    user_repo = UserRepository()
    users = user_repo.get_all(role_filter=role_filter)
    
    return jsonify({
        'users': users_schema.dump(users)
    }), 200


# ============ Admin Dashboard ============
@cm_admin_bp.route('/dashboard', methods=['GET'])
@token_required
@require_admin
def admin_dashboard():
    """
    Get admin dashboard data
    ---
    get:
      summary: Get dashboard statistics for admin
      tags:
        - Admin Dashboard
      security:
        - BearerAuth: []
      responses:
        200:
          description: Dashboard data
    """
    job_repo = JobRepository()
    user_repo = UserRepository()
    app_repo = ApplicationRepository()
    
    # Get statistics
    all_jobs = job_repo.get_all()
    pending_jobs = job_repo.get_by_status(JobStatus.PENDING) if hasattr(JobStatus, 'PENDING') else []
    
    # Count both OPEN and APPROVED
    open_jobs_list = job_repo.get_by_status(JobStatus.OPEN)
    approved_jobs_list = job_repo.get_by_status(JobStatus.APPROVED)
    confirmed_jobs_count = len(open_jobs_list) + len(approved_jobs_list)
    
    all_users = user_repo.get_all()
    
    return jsonify({
        'total_jobs': len(all_jobs) if all_jobs else 0,
        'pending_jobs': len(pending_jobs) if pending_jobs else 0,
        'open_jobs': confirmed_jobs_count,
        'approved_jobs': len(approved_jobs_list), # Add specific count too
        'total_users': len(all_users) if all_users else 0,
        'recent_jobs': jobs_schema.dump(all_jobs[:10] if all_jobs else []),
        'stats': {
            'candidates': len([u for u in (all_users or []) if u.get('role') == 'candidate']),
            'recruiters': len([u for u in (all_users or []) if u.get('role') == 'recruiter'])
        }
    }), 200
