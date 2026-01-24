from flask import Blueprint, request, jsonify
from api.schemas.careermate_schemas import (
    CandidateProfileSchema, RecruiterProfileSchema, CompanySchema
)
from api.controllers.careermate.auth_controller import token_required
from infrastructure.repositories.careermate.user_repository import (
    CandidateRepository, RecruiterRepository
)
from services.careermate.profile_service import ProfileService


# Create blueprint
cm_profile_bp = Blueprint('cm_profile', __name__, url_prefix='/api/profile')

# Schemas
candidate_schema = CandidateProfileSchema()
recruiter_schema = RecruiterProfileSchema()
company_schema = CompanySchema()


def get_profile_service():
    return ProfileService(
        candidate_repository=CandidateRepository(),
        recruiter_repository=RecruiterRepository()
    )


@cm_profile_bp.route('/candidate', methods=['GET'])
@token_required
def get_candidate_profile():
    """
    Get candidate profile
    ---
    get:
      summary: Get current candidate's profile
      tags:
        - CareerMate Profile
      security:
        - BearerAuth: []
      responses:
        200:
          description: Candidate profile
        404:
          description: Profile not found
    """
    current_user = request.current_user
    
    profile_service = get_profile_service()
    profile = profile_service.get_candidate_profile(current_user.get('user_id'))
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(candidate_schema.dump(profile)), 200


@cm_profile_bp.route('/candidate', methods=['PUT'])
@token_required
def update_candidate_profile():
    """
    Update candidate profile
    ---
    put:
      summary: Update current candidate's profile
      tags:
        - CareerMate Profile
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CandidateProfile'
      responses:
        200:
          description: Profile updated
    """
    current_user = request.current_user
    data = request.get_json()
    
    profile_service = get_profile_service()
    profile = profile_service.update_candidate_profile(
        user_id=current_user.get('user_id'),
        data=data
    )
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(candidate_schema.dump(profile)), 200


@cm_profile_bp.route('/recruiter', methods=['GET'])
@token_required
def get_recruiter_profile():
    """
    Get recruiter profile
    ---
    get:
      summary: Get current recruiter's profile
      tags:
        - CareerMate Profile
      security:
        - BearerAuth: []
      responses:
        200:
          description: Recruiter profile
        404:
          description: Profile not found
    """
    current_user = request.current_user
    
    profile_service = get_profile_service()
    profile = profile_service.get_recruiter_profile(current_user.get('user_id'))
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(recruiter_schema.dump(profile)), 200


@cm_profile_bp.route('/recruiter', methods=['PUT'])
@token_required
def update_recruiter_profile():
    """
    Update recruiter profile
    ---
    put:
      summary: Update current recruiter's profile
      tags:
        - CareerMate Profile
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RecruiterProfile'
      responses:
        200:
          description: Profile updated
    """
    current_user = request.current_user
    data = request.get_json()
    
    profile_service = get_profile_service()
    profile = profile_service.update_recruiter_profile(
        user_id=current_user.get('user_id'),
        data=data
    )
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(recruiter_schema.dump(profile)), 200
