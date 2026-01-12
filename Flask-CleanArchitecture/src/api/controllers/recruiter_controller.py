from flask import Blueprint, jsonify, request
from services.job_service import JobService
from infrastructure.repositories.job_repository import JobRepository
from infrastructure.databases.mssql import session
from api.schemas.job_schema import JobSchema, JobRequestSchema

bp = Blueprint('recruiter', __name__, url_prefix='/api/recruiter')

job_service = JobService(JobRepository(session))
job_schema = JobSchema()
jobs_schema = JobSchema(many=True)
job_request_schema = JobRequestSchema()

@bp.route('/jobs', methods=['GET'])
def get_my_jobs():
    """
    Get recruiter's jobs
    ---
    get:
      summary: Get list of jobs created by the recruiter
      parameters:
        - name: status
          in: query
          schema:
            type: string
          required: false
      responses:
        200:
          description: List of jobs
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobs:
                    type: array
                    items:
                      $ref: '#/components/schemas/Job'
    """
    try:
        status = request.args.get('status')
        # TODO: Get recruiter_id from current user context. For now assuming all jobs or passed via query?
        # Actually for 'getMyJobs', we should filter by the logged in user.
        # Since auth middleware is not yet fully visible to me (except I saw `middleware` in app.py), 
        # I'll implement a basic version. 
        # In a real app, I'd get `g.user.id` or similar. 
        # For this prototype/MVP step, I will fetch ALL jobs if no filter, or filter by status.
        # Ideally: recruiter_id = g.user.id
        
        jobs = job_service.list_jobs(status=status)
        return jsonify({'jobs': jobs_schema.dump(jobs)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs', methods=['POST'])
def create_job():
    """
    Create a new job posting
    ---
    post:
      summary: Create a new job
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobRequest'
      responses:
        200:
          description: Job created successfully
    """
    try:
        data = request.get_json()
        errors = job_request_schema.validate(data)
        if errors:
            return jsonify({'error': 'Dữ liệu không hợp lệ', 'details': errors}), 400
            
        # TODO: Set recruiter_id from auth context
        recruiter_id = 1 # Mock recruiter ID
        
        job = job_service.create_job(data, recruiter_id)
        return jsonify({'message': 'Tạo tin tuyển dụng thành công', 'job': job_schema.dump(job)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """
    Update a job posting
    ---
    put:
      summary: Update a job
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobRequest'
      responses:
        200:
          description: Job updated successfully
    """
    try:
        data = request.get_json()
        # Partial validation or full? For PUT usually full or partial.
        # allowing partial updates manually for now or via schema with partial=True
        
        job = job_service.update_job(job_id, data)
        if job:
            return jsonify({'message': 'Cập nhật thành công', 'job': job_schema.dump(job)}), 200
        else:
            return jsonify({'error': 'Không tìm thấy tin tuyển dụng'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs/<int:job_id>/submit', methods=['POST'])
def submit_job(job_id):
    """
    Submit a job for review
    ---
    post:
      summary: Submit job for review
      responses:
        200:
          description: Job submitted successfully
    """
    try:
        job = job_service.submit_for_review(job_id)
        if job:
            return jsonify({'message': 'Đã gửi duyệt thành công', 'job': job_schema.dump(job)}), 200
        else:
            return jsonify({'error': 'Không tìm thấy tin tuyển dụng'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """
    Delete a job posting by ID
    ---
    delete:
      summary: Delete a job posting
      responses:
        200:
          description: Job deleted successfully
        404:
          description: Job not found
    """
    try:
        success = job_service.delete_job(job_id)
        if success:
            return jsonify({'message': 'Tin tuyển dụng đã được xóa thành công'}), 200
        else:
            return jsonify({'error': 'Không tìm thấy tin tuyển dụng hoặc không thể xóa'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
