from flask import Blueprint, request, jsonify
from api.schemas.careermate_schemas import JobPostSchema, JobApplicationSchema
from api.controllers.careermate.auth_controller import token_required
from infrastructure.repositories.careermate.job_repository import JobRepository, ApplicationRepository
from services.careermate.job_service import JobService


# Create blueprint
cm_job_bp = Blueprint('cm_job', __name__, url_prefix='/api/jobs')

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


@cm_job_bp.route('', methods=['GET'])
def list_jobs():
    """
    List all job posts
    ---
    get:
      summary: List all open job posts with filters
      tags:
        - CareerMate Jobs
      parameters:
        - name: page
          in: query
          type: integer
          default: 1
        - name: per_page
          in: query
          type: integer
          default: 10
        - name: search
          in: query
          type: string
        - name: location
          in: query
          type: string
        - name: status
          in: query
          type: string
          default: approved
          description: Filter by job status (approved, open, pending, etc.)
      responses:
        200:
          description: List of job posts
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    location = request.args.get('location', '')
    status = request.args.get('status', 'approved')  # Default to approved
    
    job_service = get_job_service()
    jobs, total = job_service.list_jobs(page, per_page, search, location, status)
    
    return jsonify({
        'jobs': jobs_schema.dump(jobs),
        'total': total,
        'page': page,
        'per_page': per_page
    }), 200


@cm_job_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """
    Get job details
    ---
    get:
      summary: Get job post details by ID
      tags:
        - CareerMate Jobs
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      responses:
        200:
          description: Job details
        404:
          description: Job not found
    """
    job_service = get_job_service()
    job = job_service.get_job_by_id(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(job_schema.dump(job)), 200


@cm_job_bp.route('', methods=['POST'])
@token_required
def create_job():
    """
    Create a new job post
    ---
    post:
      summary: Create a new job post (recruiter only)
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobPost'
      responses:
        201:
          description: Job created successfully
        403:
          description: Only recruiters can create jobs
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'recruiter':
        return jsonify({'error': 'Only recruiters can create job posts'}), 403
    
    data = request.get_json()
    errors = job_schema.validate(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    job_service = get_job_service()
    job = job_service.create_job(
        recruiter_user_id=current_user.get('user_id'),
        data=data
    )
    
    return jsonify(job_schema.dump(job)), 201


@cm_job_bp.route('/<int:job_id>', methods=['PUT'])
@token_required
def update_job(job_id):
    """
    Update a job post
    ---
    put:
      summary: Update job post (owner only)
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      responses:
        200:
          description: Job updated
        403:
          description: Unauthorized
    """
    current_user = request.current_user
    data = request.get_json()
    
    job_service = get_job_service()
    job = job_service.update_job(job_id, current_user.get('user_id'), data)
    
    if not job:
        return jsonify({'error': 'Job not found or unauthorized'}), 404
    
    return jsonify(job_schema.dump(job)), 200


@cm_job_bp.route('/<int:job_id>', methods=['DELETE'])
@token_required
def delete_job(job_id):
    """
    Delete a job post
    ---
    delete:
      summary: Delete job post (owner only)
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      responses:
        200:
          description: Job deleted
        403:
          description: Unauthorized
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    success = job_service.delete_job(job_id, current_user.get('user_id'))
    
    if not success:
        return jsonify({'error': 'Job not found or unauthorized'}), 404
    
    return jsonify({'message': 'Job deleted successfully'}), 200


# ============ Applications ============
@cm_job_bp.route('/<int:job_id>/apply', methods=['POST'])
@token_required
def apply_job(job_id):
    """
    Apply for a job
    ---
    post:
      summary: Apply for a job (candidate only)
      tags:
        - CareerMate Applications
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                resume_id:
                  type: integer
                cover_letter:
                  type: string
      responses:
        201:
          description: Application submitted
        403:
          description: Only candidates can apply
        400:
          description: Already applied or invalid request
    """
    current_user = request.current_user
    
    if current_user.get('role') != 'candidate':
        return jsonify({
            'success': False,
            'error': 'Only candidates can apply for jobs'
        }), 403
    
    data = request.get_json() or {}
    
    job_service = get_job_service()
    
    # Check if already applied
    existing = job_service.check_existing_application(
        job_id=job_id,
        user_id=current_user.get('user_id')
    )
    if existing:
        return jsonify({
            'success': False,
            'error': 'You have already applied for this job'
        }), 400
    
    application = job_service.apply_for_job(
        job_id=job_id,
        candidate_user_id=current_user.get('user_id'),
        resume_id=data.get('resume_id'),
        cover_letter=data.get('cover_letter')
    )
    
    if not application:
        return jsonify({
            'success': False,
            'error': 'Could not apply for job'
        }), 400
    
    return jsonify({
        'success': True,
        'application_id': application.app_id,
        'message': 'Application submitted successfully'
    }), 201


@cm_job_bp.route('/applications', methods=['GET'])
@token_required
def list_my_applications():
    """
    List my applications
    ---
    get:
      summary: List current user's applications
      tags:
        - CareerMate Applications
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of applications
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    applications = job_service.get_user_applications(current_user.get('user_id'))
    
    return jsonify({
        'applications': applications_schema.dump(applications)
    }), 200


@cm_job_bp.route('/saved', methods=['GET'])
@token_required
def list_saved_jobs():
    """
    List saved jobs
    ---
    get:
      summary: List saved/bookmarked jobs
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of saved jobs
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    jobs = job_service.get_saved_jobs(current_user.get('user_id'))
    
    return jsonify({
        'saved_jobs': jobs_schema.dump(jobs)
    }), 200


@cm_job_bp.route('/<int:job_id>/save', methods=['POST'])
@token_required
def save_job(job_id):
    """
    Save/bookmark a job
    ---
    post:
      summary: Save a job for later
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      responses:
        201:
          description: Job saved
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    success = job_service.save_job(job_id, current_user.get('user_id'))
    
    return jsonify({'message': 'Job saved successfully'}), 201


@cm_job_bp.route('/<int:job_id>/unsave', methods=['DELETE'])
@token_required
def unsave_job(job_id):
    """
    Remove saved job
    ---
    delete:
      summary: Remove job from saved list
      tags:
        - CareerMate Jobs
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          type: integer
          required: true
      responses:
        200:
          description: Job removed from saved
    """
    current_user = request.current_user
    
    job_service = get_job_service()
    job_service.unsave_job(job_id, current_user.get('user_id'))
    
    return jsonify({'message': 'Job removed from saved list'}), 200
