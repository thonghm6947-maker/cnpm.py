# AI Controller - Career Coach AI & CV Analyzer endpoints
from flask import Blueprint, request, jsonify, g
from functools import wraps
import jwt
import os
from config import Config
from infrastructure.databases.factory_database import FactoryDatabase
from infrastructure.models.careermate.user_model import CMUserModel
from infrastructure.models.careermate.candidate_profile_model import CandidateProfileModel
from services.careermate.cv_analyzer_service import CVAnalyzerService
from services.careermate.career_coach_service import CareerCoachService
from services.careermate.gemini_service import GeminiService
from api.schemas.careermate_schemas import (
    CVAnalyzeRequestSchema,
    CareerCoachMessageRequestSchema,
    CareerRoadmapRequestSchema
)

cm_ai_bp = Blueprint('cm_ai', __name__, url_prefix='/api/ai')


def get_session():
    """Get database session."""
    return FactoryDatabase.get_database('POSTGREE').session


def token_required(f):
    """Decorator to require valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            from flask import current_app
            secret_key = current_app.config.get('SECRET_KEY')
            if not secret_key:
                secret_key = 'careermate_default_secret_key_123'
            
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            current_user = get_session().query(CMUserModel).filter_by(user_id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated


# ============== CV Analyzer Endpoints ==============

@cm_ai_bp.route('/cv-analyze', methods=['POST'])
@token_required
def analyze_cv():
    """
    Analyze CV/Resume using AI.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            resume_id:
              type: integer
              description: ID of existing resume to analyze
            cv_text:
              type: string
              description: Raw CV text to analyze (if no resume_id)
            job_description:
              type: string
              description: Optional job description to match against
            target_role:
              type: string
              description: Optional target role for the analysis
    responses:
      200:
        description: CV analysis result
      400:
        description: Invalid request
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    try:
        data = request.get_json() or {}
        
        # Validate input
        schema = CVAnalyzeRequestSchema()
        errors = schema.validate(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Check if API key is configured
        if not Config.GEMINI_API_KEY:
            return jsonify({'error': 'AI service not configured. Please set GEMINI_API_KEY.'}), 500
        
        # Initialize service
        cv_service = CVAnalyzerService()
        
        resume_id = data.get('resume_id')
        cv_text = data.get('cv_text')
        job_description = data.get('job_description')
        target_role = data.get('target_role')
        
        if resume_id:
            # Analyze by resume ID
            result = cv_service.analyze_resume_by_id(
                resume_id=resume_id,
                job_description=job_description,
                save_result=True
            )
        elif cv_text:
            # Analyze raw CV text
            result = cv_service.analyze_cv(
                cv_text=cv_text,
                job_description=job_description,
                target_role=target_role
            )
        else:
            return jsonify({'error': 'Either resume_id or cv_text is required'}), 400
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@cm_ai_bp.route('/cv-improve', methods=['POST'])
@token_required
def get_cv_improvements():
    """
    Get detailed CV improvement suggestions for a specific role.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - cv_text
            - target_role
          properties:
            cv_text:
              type: string
            target_role:
              type: string
    responses:
      200:
        description: Improvement suggestions
      400:
        description: Invalid request
    """
    try:
        data = request.get_json() or {}
        
        cv_text = data.get('cv_text')
        target_role = data.get('target_role')
        
        if not cv_text or not target_role:
            return jsonify({'error': 'cv_text and target_role are required'}), 400
        
        if not Config.GEMINI_API_KEY:
            return jsonify({'error': 'AI service not configured'}), 500
        
        cv_service = CVAnalyzerService()
        suggestions = cv_service.get_improvement_suggestions(cv_text, target_role)
        
        return jsonify({
            'success': True,
            'data': {
                'target_role': target_role,
                'suggestions': suggestions
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============== Career Coach Endpoints ==============

@cm_ai_bp.route('/career-coach', methods=['POST'])
@token_required
def send_career_coach_message():
    """
    Send a message to Career Coach AI.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - message
          properties:
            message:
              type: string
              description: User's message
            session_id:
              type: integer
              description: Existing session ID (optional)
            topic:
              type: string
              description: Topic for new session (optional)
    responses:
      200:
        description: AI response
      400:
        description: Invalid request
    """
    try:
        data = request.get_json() or {}
        
        # Validate
        schema = CareerCoachMessageRequestSchema()
        errors = schema.validate(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        if not Config.GEMINI_API_KEY:
            return jsonify({'error': 'AI service not configured'}), 500
        
        user_id = g.current_user.user_id
        message = data.get('message')
        session_id = data.get('session_id')
        topic = data.get('topic')
        
        coach_service = CareerCoachService()
        
        # Get or create session
        if session_id:
            # Verify session belongs to user
            from infrastructure.models.careermate.chat_session_model import ChatSessionModel
            session = get_session().query(ChatSessionModel).filter_by(
                session_id=session_id,
                user_id=user_id
            ).first()
            
            if not session:
                return jsonify({'error': 'Session not found or unauthorized'}), 404
        else:
            # Create new session
            session = coach_service.create_new_session(user_id, topic)
            session_id = session.session_id
        
        # Get user context for better responses
        candidate = get_session().query(CandidateProfileModel).filter_by(user_id=user_id).first()
        user_context = None
        if candidate:
            user_context = {
                'name': candidate.full_name,
                'bio': candidate.bio
            }
        
        # Send message and get response
        result = coach_service.send_message(
            session_id=session_id,
            user_message=message,
            user_context=user_context
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@cm_ai_bp.route('/chat-sessions', methods=['GET'])
@token_required
def get_chat_sessions():
    """
    Get user's chat sessions.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    responses:
      200:
        description: List of chat sessions
    """
    try:
        user_id = g.current_user.user_id
        coach_service = CareerCoachService()
        sessions = coach_service.get_user_sessions(user_id)
        
        return jsonify({
            'success': True,
            'data': sessions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cm_ai_bp.route('/chat-sessions/<int:session_id>', methods=['DELETE'])
@token_required
def delete_chat_session(session_id):
    """
    Delete a chat session.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: path
        name: session_id
        type: integer
        required: true
    responses:
      200:
        description: Session deleted
      404:
        description: Session not found
    """
    try:
        user_id = g.current_user.user_id
        
        from infrastructure.models.careermate.chat_session_model import ChatSessionModel
        from infrastructure.models.careermate.chat_message_model import ChatMessageModel
        
        session = get_session().query(ChatSessionModel).filter_by(
            session_id=session_id,
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Delete messages first
        get_session().query(ChatMessageModel).filter_by(session_id=session_id).delete()
        get_session().delete(session)
        get_session().commit()
        
        return jsonify({
            'success': True,
            'message': 'Session deleted'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cm_ai_bp.route('/chat-sessions/<int:session_id>/messages', methods=['GET'])
@token_required
def get_session_messages(session_id):
    """
    Get messages in a chat session.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: path
        name: session_id
        type: integer
        required: true
    responses:
      200:
        description: List of messages
      404:
        description: Session not found
    """
    try:
        user_id = g.current_user.user_id
        
        # Verify session belongs to user
        from infrastructure.models.careermate.chat_session_model import ChatSessionModel
        session = get_session().query(ChatSessionModel).filter_by(
            session_id=session_id,
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        coach_service = CareerCoachService()
        messages = coach_service.get_session_history(session_id)
        
        return jsonify({
            'success': True,
            'data': {
                'session_id': session_id,
                'topic': session.topic,
                'messages': messages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============== Career Roadmap Endpoints ==============

@cm_ai_bp.route('/career-roadmap', methods=['POST'])
@token_required
def generate_career_roadmap():
    """
    Generate a personalized career development roadmap.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - target_role
          properties:
            target_role:
              type: string
              description: Target career role
            current_role:
              type: string
              description: Current job role
            current_skills:
              type: array
              items:
                type: string
              description: List of current skills
            time_frame:
              type: string
              description: Target time frame (e.g., "6 months", "1 year")
    responses:
      200:
        description: Generated career roadmap
      400:
        description: Invalid request
    """
    try:
        data = request.get_json() or {}
        
        # Validate
        schema = CareerRoadmapRequestSchema()
        errors = schema.validate(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        if not Config.GEMINI_API_KEY:
            return jsonify({'error': 'AI service not configured'}), 500
        
        user_id = g.current_user.user_id
        
        coach_service = CareerCoachService()
        roadmap = coach_service.generate_career_roadmap(
            user_id=user_id,
            target_role=data['target_role'],
            current_skills=data.get('current_skills'),
            current_role=data.get('current_role'),
            time_frame=data.get('time_frame', '12 months')
        )
        
        return jsonify({
            'success': True,
            'data': roadmap
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cm_ai_bp.route('/career-roadmaps', methods=['GET'])
@token_required
def get_career_roadmaps():
    """
    Get user's career roadmaps.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    responses:
      200:
        description: List of career roadmaps
    """
    try:
        user_id = g.current_user.user_id
        coach_service = CareerCoachService()
        roadmaps = coach_service.get_user_roadmaps(user_id)
        
        return jsonify({
            'success': True,
            'data': roadmaps
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cm_ai_bp.route('/career-roadmaps/<int:roadmap_id>', methods=['DELETE'])
@token_required
def delete_career_roadmap(roadmap_id):
    """
    Delete a career roadmap.
    ---
    tags:
      - AI
    security:
      - Bearer: []
    parameters:
      - in: path
        name: roadmap_id
        type: integer
        required: true
    responses:
      200:
        description: Roadmap deleted
      404:
        description: Roadmap not found
    """
    try:
        user_id = g.current_user.user_id
        
        from infrastructure.models.careermate.career_roadmap_model import CareerRoadmapModel
        
        # Get candidate
        candidate = get_session().query(CandidateProfileModel).filter_by(user_id=user_id).first()
        if not candidate:
            return jsonify({'error': 'Candidate profile not found'}), 404
        
        roadmap = get_session().query(CareerRoadmapModel).filter_by(
            roadmap_id=roadmap_id,
            candidate_id=candidate.candidate_id
        ).first()
        
        if not roadmap:
            return jsonify({'error': 'Roadmap not found'}), 404
        
        get_session().delete(roadmap)
        get_session().commit()
        
        return jsonify({
            'success': True,
            'message': 'Roadmap deleted'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============== Health Check ==============

@cm_ai_bp.route('/health', methods=['GET'])
def ai_health_check():
    """
    Check AI service health status.
    ---
    tags:
      - AI
    responses:
      200:
        description: Service health status
    """
    status = {
        'service': 'AI Service',
        'gemini_configured': bool(Config.GEMINI_API_KEY),
        'model': Config.GEMINI_MODEL or 'gemini-2.0-flash'
    }
    
    if Config.GEMINI_API_KEY:
        try:
            # Quick test of Gemini connection
            gemini = GeminiService()
            status['gemini_status'] = 'connected'
        except Exception as e:
            status['gemini_status'] = f'error: {str(e)}'
    else:
        status['gemini_status'] = 'not configured'
    
    return jsonify(status), 200
