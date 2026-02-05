from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
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
    List all users with full profile data
    ---
    get:
      summary: List all users with candidate/recruiter profiles
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
          description: List of users with profiles
    """
    role_filter = request.args.get('role')
    
    user_repo = UserRepository()
    users = user_repo.get_all_with_profiles(role_filter=role_filter)
    
    return jsonify({
        'success': True,
        'users': users
    }), 200


@cm_admin_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@require_admin
def get_user_detail(user_id):
    """
    Get user detail with profile
    ---
    get:
      summary: Get single user with full profile
      tags:
        - Admin Users
      security:
        - BearerAuth: []
      responses:
        200:
          description: User detail
        404:
          description: User not found
    """
    user_repo = UserRepository()
    user = user_repo.get_user_with_profile(user_id)
    
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'user': user
    }), 200


@cm_admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@require_admin
def update_user_status(user_id):
    """
    Update user status (activate/deactivate)
    ---
    put:
      summary: Update user status
      tags:
        - Admin Users
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  enum: [active, inactive]
      responses:
        200:
          description: User status updated
        404:
          description: User not found
    """
    data = request.get_json() or {}
    new_status = data.get('status')
    
    if new_status not in ['active', 'inactive']:
        return jsonify({'success': False, 'error': 'Invalid status. Must be "active" or "inactive"'}), 400
    
    user_repo = UserRepository()
    is_active = (new_status == 'active')
    
    success = user_repo.update_status(user_id, is_active)
    
    if not success:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User status updated successfully'
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
    
    # Get all lists for calculation
    all_jobs = job_repo.get_all()
    all_users = user_repo.get_all() # Dicts with created_at
    
    # Helper for safe status check
    def check_status(obj, status_val):
        s = getattr(obj, 'status', None)
        # Handle enum or string
        if hasattr(s, 'value'): return s.value == status_val
        return str(s) == status_val

    # Job Stats
    pending_jobs = [j for j in all_jobs if check_status(j, 'PENDING')]
    approved_jobs = [j for j in all_jobs if check_status(j, 'APPROVED')]
    rejected_jobs = [j for j in all_jobs if check_status(j, 'REJECTED')]
    
    # User Stats
    active_users = [u for u in all_users if u.get('is_active')]
    candidates = [u for u in all_users if u.get('role') == 'candidate']
    recruiters = [u for u in all_users if u.get('role') == 'recruiter']
    
    # Growth Calculation (Last 6 months)
    today = datetime.now()
    growth_data = []
    
    # Initialize last 6 months buckets
    for i in range(5, -1, -1):
        date = today - timedelta(days=i*30)
        month_key = (date.year, date.month)
        month_label = f"T{date.month}"
        
        # Count users in this month
        count = 0
        for u in all_users:
            c_at_str = u.get('created_at')
            if c_at_str:
                try:
                    # Handle ISO format variants
                    c_date = datetime.fromisoformat(c_at_str.replace('Z', '+00:00'))
                    if c_date.year == month_key[0] and c_date.month == month_key[1]:
                        count += 1
                except:
                    pass
        
        growth_data.append({'month': month_label, 'users': count})

    # Recent Activities (Mock/Derived)
    recent_activities = []
    # Add recent jobs as activities
    sorted_jobs = sorted(all_jobs, key=lambda x: x.created_at if hasattr(x, 'created_at') else '', reverse=True)[:5]
    for job in sorted_jobs:
        if hasattr(job, 'created_at') and job.created_at:
            time_str = job.created_at.strftime("%H:%M %d/%m")
            recent_activities.append({
                'id': job.job_id,
                'type': 'job_submit',
                'message': f"New job posted: {job.title}",
                'time': time_str
            })
            
    return jsonify({
        'success': True,
        'data': {
            'total_users': len(all_users),
            'active_users': len(active_users),
            'total_candidates': len(candidates),
            'total_recruiters': len(recruiters),
            'total_jobs': len(all_jobs),
            'pending_jobs': len(pending_jobs),
            'approved_jobs': len(approved_jobs),
            'rejected_jobs': len(rejected_jobs),
            'total_applications': app_repo.count_all(),
            'total_subscriptions': 0,
            'monthly_revenue': 0,
            'user_growth': growth_data,
            'revenue_data': [
                {'month': 'T1', 'revenue': 0},
                {'month': 'T2', 'revenue': 0},
                {'month': 'T3', 'revenue': 0},
                {'month': 'T4', 'revenue': 0},
                {'month': 'T5', 'revenue': 0},
                {'month': 'T6', 'revenue': 0}
            ],
            'recent_activities': recent_activities
        }
    }), 200
