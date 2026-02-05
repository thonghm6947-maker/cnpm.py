from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from api.schemas.careermate_schemas import (
    RegisterRequestSchema, RegisterResponseSchema,
    LoginRequestSchema, LoginResponseSchema,
    UserResponseSchema
)
from services.careermate.auth_service import AuthService
from infrastructure.repositories.careermate.user_repository import (
    UserRepository, CandidateRepository, RecruiterRepository
)


# Create blueprint
cm_auth_bp = Blueprint('cm_auth', __name__, url_prefix='/api/auth')

# Initialize services (will use database session from factory)
def get_auth_service():
    # Ensure SECRET_KEY is always a string
    secret_key = current_app.config.get('SECRET_KEY')
    if not secret_key or not isinstance(secret_key, str):
        secret_key = 'careermate_default_secret_key_123'
    
    return AuthService(
        user_repository=UserRepository(),
        candidate_repository=CandidateRepository(),
        recruiter_repository=RecruiterRepository(),
        secret_key=secret_key
    )


# Schemas
register_request_schema = RegisterRequestSchema()
register_response_schema = RegisterResponseSchema()
login_request_schema = LoginRequestSchema()
login_response_schema = LoginResponseSchema()
user_response_schema = UserResponseSchema()


def token_required(f):
    """Decorator to require JWT token for endpoints."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        auth_service = get_auth_service()
        payload = auth_service.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated


@cm_auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    post:
      summary: Register a new user (candidate or recruiter)
      tags:
        - CareerMate Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - password_confirm
                - role
                - full_name
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
                password_confirm:
                  type: string
                role:
                  type: string
                  enum: [candidate, recruiter]
                full_name:
                  type: string
                phone:
                  type: string
      responses:
        201:
          description: User registered successfully
        400:
          description: Validation error or user exists
    """
    data = request.get_json()
    
    # Debug: Print received data
    print(f"Register request data: {data}")
    
    # Validate request
    errors = register_request_schema.validate(data)
    if errors:
        print(f"Validation errors: {errors}")
        return jsonify({'errors': errors}), 400
    
    # Check password match
    if data.get('password') != data.get('password_confirm'):
        return jsonify({'error': 'Passwords do not match'}), 400
    
    # Register user
    auth_service = get_auth_service()
    user = auth_service.register(
        email=data.get('email'),
        password=data.get('password'),
        role=data.get('role'),
        full_name=data.get('full_name'),
        phone=data.get('phone')
    )
    
    if not user:
        return jsonify({'error': 'Email already exists'}), 400
    
    result = register_response_schema.dump({
        'user_id': user.user_id,
        'email': user.email,
        'role': user.role,
        'message': 'User registered successfully'
    })
    
    return jsonify(result), 201


@cm_auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    ---
    post:
      summary: Login and get JWT token
      tags:
        - CareerMate Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        200:
          description: Login successful, returns JWT token
        401:
          description: Invalid credentials
    """
    data = request.get_json()
    
    # Validate request
    errors = login_request_schema.validate(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Login
    try:
        auth_service = get_auth_service()
        result = auth_service.login(
            email=data.get('email'),
            password=data.get('password')
        )
        
        if not result:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        print(f"Login result: {result}")
        return jsonify(result), 200
    except Exception as e:
        import traceback
        print(f"Login error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@cm_auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """
    Get current user info
    ---
    get:
      summary: Get current authenticated user info
      tags:
        - CareerMate Auth
      security:
        - BearerAuth: []
      responses:
        200:
          description: Current user info
        401:
          description: Unauthorized
    """
    user_data = request.current_user
    
    auth_service = get_auth_service()
    user = auth_service.user_repo.get_by_id(user_data.get('user_id'))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    result = user_response_schema.dump({
        'user_id': user.user_id,
        'email': user.email,
        'role': user.role,
        'is_active': user.is_active
    })
    
    return jsonify(result), 200


@cm_auth_bp.route('/check', methods=['GET'])
def health_check():
    """
    Health check endpoint
    ---
    get:
      summary: Check if auth API is working
      tags:
        - CareerMate Auth
      responses:
        200:
          description: API is working
    """
    return jsonify({'message': 'CareerMate Auth API is working!'}), 200


# ============== Password Reset Endpoints ==============

@cm_auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Request password reset OTP
    ---
    post:
      summary: Send OTP to user's email for password reset
      tags:
        - CareerMate Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
              properties:
                email:
                  type: string
                  format: email
      responses:
        200:
          description: OTP sent successfully
        400:
          description: Invalid email format
        500:
          description: Server error
    """
    from services.careermate.password_reset_service import PasswordResetService
    
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'error': 'Email là bắt buộc.'}), 400
    
    # Basic email validation
    if '@' not in email or '.' not in email:
        return jsonify({'error': 'Email không hợp lệ.'}), 400
    
    try:
        service = PasswordResetService()
        result = service.send_otp(email)
        
        if result.get('success'):
            return jsonify({'message': result.get('message')}), 200
        else:
            return jsonify({'error': result.get('message')}), 400
            
    except Exception as e:
        print(f"Forgot password error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Đã xảy ra lỗi. Vui lòng thử lại sau.'}), 500


@cm_auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verify OTP code
    ---
    post:
      summary: Verify the OTP code sent to user's email
      tags:
        - CareerMate Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - otp_code
              properties:
                email:
                  type: string
                  format: email
                otp_code:
                  type: string
                  minLength: 6
                  maxLength: 6
      responses:
        200:
          description: OTP is valid
        400:
          description: Invalid OTP or expired
        500:
          description: Server error
    """
    from services.careermate.password_reset_service import PasswordResetService
    
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp_code = data.get('otp_code', '').strip()
    
    if not email or not otp_code:
        return jsonify({'error': 'Email và mã OTP là bắt buộc.', 'valid': False}), 400
    
    if len(otp_code) != 6 or not otp_code.isdigit():
        return jsonify({'error': 'Mã OTP phải là 6 chữ số.', 'valid': False}), 400
    
    try:
        service = PasswordResetService()
        result = service.verify_otp(email, otp_code)
        
        if result.get('valid'):
            return jsonify({
                'message': result.get('message'),
                'valid': True
            }), 200
        else:
            return jsonify({
                'error': result.get('message'),
                'valid': False
            }), 400
            
    except Exception as e:
        print(f"Verify OTP error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Đã xảy ra lỗi. Vui lòng thử lại sau.', 'valid': False}), 500


@cm_auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset password with OTP verification
    ---
    post:
      summary: Reset user's password after OTP verification
      tags:
        - CareerMate Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - otp_code
                - new_password
              properties:
                email:
                  type: string
                  format: email
                otp_code:
                  type: string
                  minLength: 6
                  maxLength: 6
                new_password:
                  type: string
                  minLength: 6
      responses:
        200:
          description: Password reset successfully
        400:
          description: Invalid request or OTP
        500:
          description: Server error
    """
    from services.careermate.password_reset_service import PasswordResetService
    
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp_code = data.get('otp_code', '').strip()
    new_password = data.get('new_password', '')
    
    if not email or not otp_code or not new_password:
        return jsonify({'error': 'Tất cả các trường là bắt buộc.'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'Mật khẩu phải có ít nhất 6 ký tự.'}), 400
    
    try:
        service = PasswordResetService()
        result = service.reset_password(email, otp_code, new_password)
        
        if result.get('success'):
            return jsonify({'message': result.get('message')}), 200
        else:
            return jsonify({'error': result.get('message')}), 400
            
    except Exception as e:
        print(f"Reset password error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Đã xảy ra lỗi. Vui lòng thử lại sau.'}), 500


# ============== Google OAuth Endpoints ==============

@cm_auth_bp.route('/google', methods=['GET'])
def google_login():
    """
    Initiate Google OAuth login
    ---
    get:
      summary: Start Google OAuth flow
      tags:
        - CareerMate Auth
      parameters:
        - name: role
          in: query
          type: string
          enum: [candidate, recruiter]
          default: candidate
          description: User role for new registrations
      responses:
        302:
          description: Redirect to Google OAuth consent page
        500:
          description: OAuth configuration error
    """
    from services.careermate.oauth_service import get_oauth_service
    
    role = request.args.get('role', 'candidate')
    if role not in ['candidate', 'recruiter']:
        role = 'candidate'
    
    try:
        oauth_service = get_oauth_service()
        result = oauth_service.get_google_auth_url(role)
        
        # Redirect to Google OAuth
        from flask import redirect
        return redirect(result['auth_url'])
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"Google OAuth error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to initiate Google OAuth'}), 500


@cm_auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """
    Handle Google OAuth callback
    ---
    get:
      summary: Handle Google OAuth callback
      tags:
        - CareerMate Auth
      parameters:
        - name: code
          in: query
          type: string
          required: true
          description: Authorization code from Google
        - name: state
          in: query
          type: string
          description: State parameter
      responses:
        302:
          description: Redirect to frontend with token
        400:
          description: Missing authorization code
        401:
          description: OAuth authentication failed
    """
    from services.careermate.oauth_service import get_oauth_service
    from flask import redirect
    
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    # Handle OAuth errors (user denied access, etc.)
    if error:
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        return redirect(f"{frontend_url}/login?error={error}")
    
    if not code:
        return jsonify({'error': 'Authorization code is missing'}), 400
    
    try:
        oauth_service = get_oauth_service()
        result = oauth_service.handle_google_callback(code, state)
        
        if not result:
            return jsonify({'error': 'OAuth authentication failed'}), 401
        
        # Redirect to frontend with token
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        access_token = result['access_token']
        role = result['user']['role']
        
        # Redirect to frontend with token in URL fragment (more secure than query params)
        return redirect(f"{frontend_url}/oauth/callback?token={access_token}&role={role}")
        
    except Exception as e:
        print(f"Google OAuth callback error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'OAuth callback failed'}), 500
