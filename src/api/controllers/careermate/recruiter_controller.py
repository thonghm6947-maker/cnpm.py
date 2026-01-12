from flask import Blueprint, request, jsonify
from api.controllers.careermate.auth_controller import token_required
from infrastructure.repositories.careermate.job_repository import (
    JobRepository, ApplicationRepository
)
from infrastructure.repositories.careermate.user_repository import RecruiterRepository
from infrastructure.models.careermate.job_post_model import JobStatus
from services.careermate.job_service import JobService
from api.schemas.careermate_schemas import JobPostSchema, JobApplicationSchema


# Create blueprint
cm_recruiter_bp = Blueprint('cm_recruiter', __name__, url_prefix='/api/recruiter')

# Schemas
job_schema = JobPostSchema()
jobs_schema = JobPostSchema(many=True)
application_schema = JobApplicationSchema()
applications_schema = JobApplicationSchema(many=True)


def get_job_service():
    return JobService(
        job_repository=JobRepository(),
        application_repository=ApplicationRepository()
    )


# ============ Recruiter Jobs ============
@cm_recruiter_bp.route('/jobs', methods=['GET'])
@token_required
def list_recruiter_jobs():
    """
    List recruiter's job posts
    ---
    get:
      summary: List all jobs posted by current recruiter
      tags:
        - Recruiter Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of recruiter's jobs
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'recruiter':
        return jsonify({'error': 'Only recruiters can access this'}), 403
    
    try:
        job_service = get_job_service()
        recruiter_repo = RecruiterRepository()
        recruiter = recruiter_repo.get_by_user_id(current_user.get('user_id'))
        
        if not recruiter:
            return jsonify({'error': 'Recruiter profile not found'}), 404
        
        jobs = job_service.job_repo.get_by_recruiter(recruiter.recruiter_id)
        
        return jsonify({
            'jobs': jobs_schema.dump(jobs)
        }), 200
    except Exception as e:
        import traceback
        with open(r'c:\Users\ADMIN\Flask-CleanArchitecture\ERROR_TRACE.log', 'w') as f:
            f.write(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@cm_recruiter_bp.route('/jobs', methods=['POST'])
@token_required
def create_recruiter_job():
    """
    Create a new job post
    ---
    post:
      summary: Create a new job post
      tags:
        - Recruiter Jobs
      security:
        - BearerAuth: []
      responses:
        201:
          description: Job created
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'recruiter':
        return jsonify({'error': 'Only recruiters can create jobs'}), 403
    
    data = request.get_json()
    
    job_service = get_job_service()
    job = job_service.create_job(
        recruiter_user_id=current_user.get('user_id'),
        data=data
    )
    
    if not job:
        return jsonify({'error': 'Failed to create job'}), 400
    
    return jsonify(job_schema.dump(job)), 201


@cm_recruiter_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@token_required
def update_recruiter_job(job_id):
    """
    Update a job post
    ---
    put:
      summary: Update a job post
      tags:
        - Recruiter Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: Job updated
    """
    current_user = request.current_user
    data = request.get_json()
    
    job_service = get_job_service()
    job = job_service.update_job(job_id, current_user.get('user_id'), data)
    
    if not job:
        return jsonify({'error': 'Job not found or unauthorized'}), 404
    
    return jsonify(job_schema.dump(job)), 200


@cm_recruiter_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@token_required
def delete_recruiter_job(job_id):
    """
    Delete a job post
    ---
    delete:
      summary: Delete a job post
      tags:
        - Recruiter Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: Job deleted
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    success = job_service.delete_job(job_id, current_user.get('user_id'))
    
    if not success:
        return jsonify({'error': 'Job not found or unauthorized'}), 404
    
    return jsonify({'message': 'Job deleted successfully'}), 200


@cm_recruiter_bp.route('/jobs/<int:job_id>/submit', methods=['POST'])
@token_required
def submit_job_for_approval(job_id):
    """
    Submit job for admin approval
    ---
    post:
      summary: Submit job for approval (change status to pending)
      tags:
        - Recruiter Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: Job submitted for approval
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    job = job_service.update_job(job_id, current_user.get('user_id'), {'status': JobStatus.PENDING})
    
    if not job:
        return jsonify({'error': 'Job not found or unauthorized'}), 404
    
    return jsonify({'message': 'Job submitted for approval', 'job': job_schema.dump(job)}), 200


# ============ Recruiter Applications ============
@cm_recruiter_bp.route('/applications', methods=['GET'])
@token_required
def list_recruiter_applications():
    """
    List applications for recruiter's jobs
    ---
    get:
      summary: List all applications for recruiter's job posts
      tags:
        - Recruiter Applications
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of applications
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'recruiter':
        return jsonify({'error': 'Only recruiters can access this'}), 403
    
    recruiter_repo = RecruiterRepository()
    recruiter = recruiter_repo.get_by_user_id(current_user.get('user_id'))
    
    if not recruiter:
        return jsonify({'error': 'Recruiter profile not found'}), 404
    
    job_service = get_job_service()
    applications = job_service.get_recruiter_applications(recruiter.recruiter_id)
    
    return jsonify({
        'applications': applications_schema.dump(applications)
    }), 200


# ============ Recruiter Dashboard ============
@cm_recruiter_bp.route('/dashboard', methods=['GET'])
@token_required
def recruiter_dashboard():
    """
    Get recruiter dashboard data
    ---
    get:
      summary: Get dashboard statistics for recruiter
      tags:
        - Recruiter Dashboard
      security:
        - BearerAuth: []
      responses:
        200:
          description: Dashboard data
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'recruiter':
        return jsonify({'error': 'Only recruiters can access this'}), 403
    
    recruiter_repo = RecruiterRepository()
    recruiter = recruiter_repo.get_by_user_id(current_user.get('user_id'))
    
    if not recruiter:
        return jsonify({'error': 'Recruiter profile not found'}), 404
    
    job_service = get_job_service()
    
    # Get statistics
    jobs = job_service.job_repo.get_by_recruiter(recruiter.recruiter_id)
    total_jobs = len(jobs) if jobs else 0
    
    applications = job_service.get_recruiter_applications(recruiter.recruiter_id)
    total_applications = len(applications) if applications else 0
    
    pending_applications = len([a for a in (applications or []) if a.status == 'pending'])
    
    return jsonify({
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'recent_jobs': jobs_schema.dump(jobs[:5] if jobs else []),
        'recent_applications': applications_schema.dump(applications[:5] if applications else [])
    }), 200
