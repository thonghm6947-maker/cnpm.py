from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from infrastructure.models.user_model import UserModel
from infrastructure.databases.mssql import session
from api.schemas.auth import RigisterUserRequestSchema, RigisterUserResponseSchema
from services.auth_service import AuthService
from infrastructure.repositories.auth_repository import AuthRepository
from hashlib import sha256
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

auth_service = AuthService(AuthRepository(session))

register_request = RigisterUserRequestSchema()
register_response = RigisterUserResponseSchema()

@auth_bp.route('/check_router', methods=['GET'])
def check_router():
    return jsonify({'message': 'Router is working!'}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    # NOTE: Disassembly shows generate_password_hash is called on the input password 
    # before passing to login. This copies that behavior.
    password = generate_password_hash(password)
    
    user = auth_service.login(username, password)
    
    if user:
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=2)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.get_json()
    errors = register_request.validate(data)
    if errors:
        return jsonify(errors), 400
        
    username = data.get('username') if isinstance(data, dict) else None
    password = data.get('password') if isinstance(data, dict) else None
    passwordconfirm = data.get('passwordconfirm') if isinstance(data, dict) else None
    email = data.get('email') if isinstance(data, dict) else None
    
    if not username or not password or not passwordconfirm or not email:
        return jsonify({'message': 'Missing required fields: username, password, passwordconfirm, email'}), 400
        
    if password != passwordconfirm:
        return jsonify({'message': 'Passwords do not match'}), 400
        
    if auth_service.check_exist(username):
        return jsonify({'message': 'User already exists. Please login.'}), 400
        
    password_hashed = generate_password_hash(password)
    new_user = auth_service.register(username, password_hashed, email)
    
    if new_user:
        result = register_response.dump(new_user)
        return jsonify(result), 201
    else:
        return jsonify({'message': 'Registration failed'}), 500
