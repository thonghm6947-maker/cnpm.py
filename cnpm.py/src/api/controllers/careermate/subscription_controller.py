from flask import Blueprint, request, jsonify
from api.controllers.careermate.auth_controller import token_required
from infrastructure.repositories.careermate.subscription_repository import SubscriptionRepository


# Create blueprint
cm_subscription_bp = Blueprint('cm_subscription', __name__, url_prefix='/api')


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


# ============ Public Endpoints ============
@cm_subscription_bp.route('/subscriptions/packages', methods=['GET'])
def list_public_packages():
    """
    List all subscription packages (public)
    ---
    get:
      summary: Get available subscription packages
      tags:
        - Subscriptions
      responses:
        200:
          description: List of packages
    """
    repo = SubscriptionRepository()
    packages = repo.get_all_packages()
    
    return jsonify({
        'success': True,
        'packages': [{
            'package_id': pkg.package_id,
            'name': pkg.name,
            'price': float(pkg.price) if pkg.price else 0,
            'duration_days': pkg.duration_days,
            'description': pkg.description,
            'features': pkg.description.split('\n') if pkg.description else []
        } for pkg in packages]
    }), 200


# ============ Admin Endpoints ============
@cm_subscription_bp.route('/admin/subscriptions/packages', methods=['GET'])
@token_required
@require_admin
def list_admin_packages():
    """
    List all packages with subscriber stats (admin only)
    ---
    get:
      summary: Get packages with subscriber counts
      tags:
        - Admin Subscriptions
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of packages with stats
    """
    repo = SubscriptionRepository()
    packages = repo.get_all_packages_with_stats()
    
    return jsonify({
        'success': True,
        'packages': packages
    }), 200


@cm_subscription_bp.route('/admin/subscriptions/packages', methods=['POST'])
@token_required
@require_admin
def create_package():
    """
    Create a new subscription package
    ---
    post:
      summary: Create new package
      tags:
        - Admin Subscriptions
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                price:
                  type: number
                duration_days:
                  type: integer
                description:
                  type: string
      responses:
        201:
          description: Package created
    """
    data = request.get_json() or {}
    
    if not data.get('name'):
        return jsonify({'success': False, 'error': 'Package name is required'}), 400
    if not data.get('price'):
        return jsonify({'success': False, 'error': 'Price is required'}), 400
    
    repo = SubscriptionRepository()
    package = repo.create_package(data)
    
    return jsonify({
        'success': True,
        'message': 'Package created successfully',
        'package': {
            'package_id': package.package_id,
            'name': package.name,
            'price': float(package.price) if package.price else 0,
            'duration_days': package.duration_days,
            'description': package.description
        }
    }), 201


@cm_subscription_bp.route('/admin/subscriptions/packages/<int:package_id>', methods=['PUT'])
@token_required
@require_admin
def update_package(package_id):
    """
    Update a subscription package
    ---
    put:
      summary: Update package
      tags:
        - Admin Subscriptions
      security:
        - BearerAuth: []
      responses:
        200:
          description: Package updated
    """
    data = request.get_json() or {}
    
    repo = SubscriptionRepository()
    package = repo.update_package(package_id, data)
    
    if not package:
        return jsonify({'success': False, 'error': 'Package not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Package updated successfully',
        'package': {
            'package_id': package.package_id,
            'name': package.name,
            'price': float(package.price) if package.price else 0,
            'duration_days': package.duration_days,
            'description': package.description
        }
    }), 200


@cm_subscription_bp.route('/admin/subscriptions/packages/<int:package_id>', methods=['DELETE'])
@token_required
@require_admin
def delete_package(package_id):
    """
    Delete a subscription package
    ---
    delete:
      summary: Delete package
      tags:
        - Admin Subscriptions
      security:
        - BearerAuth: []
      responses:
        200:
          description: Package deleted
    """
    repo = SubscriptionRepository()
    success = repo.delete_package(package_id)
    
    if not success:
        return jsonify({'success': False, 'error': 'Package not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Package deleted successfully'
    }), 200


@cm_subscription_bp.route('/admin/subscriptions/stats', methods=['GET'])
@token_required
@require_admin
def get_subscription_stats():
    """
    Get subscription statistics
    ---
    get:
      summary: Get overall subscription stats
      tags:
        - Admin Subscriptions
      security:
        - BearerAuth: []
      responses:
        200:
          description: Subscription statistics
    """
    repo = SubscriptionRepository()
    stats = repo.get_subscription_stats()
    
    return jsonify({
        'success': True,
        'stats': stats
    }), 200


# ============ User Subscription Endpoints ============
@cm_subscription_bp.route('/subscriptions/subscribe', methods=['POST'])
@token_required
def subscribe_to_package():
    """
    Subscribe user to a package (mock payment)
    ---
    post:
      summary: Subscribe to a package
      tags:
        - Subscriptions
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                package_id:
                  type: integer
                payment_method:
                  type: string
      responses:
        200:
          description: Subscription created
    """
    from datetime import datetime, timedelta
    from infrastructure.models.careermate.user_subscription_model import UserSubscriptionModel, SubscriptionStatus
    from infrastructure.databases.connection import get_careermate_session
    
    data = request.get_json() or {}
    current_user = request.current_user
    user_id = current_user.get('user_id')
    package_id = data.get('package_id')
    
    if not package_id:
        return jsonify({'success': False, 'error': 'Package ID is required'}), 400
    
    repo = SubscriptionRepository()
    package = repo.get_package_by_id(package_id)
    
    if not package:
        return jsonify({'success': False, 'error': 'Package not found'}), 404
    
    # Create subscription
    session = get_careermate_session()
    
    # Check if user already has active subscription
    existing = session.query(UserSubscriptionModel).filter(
        UserSubscriptionModel.user_id == user_id,
        UserSubscriptionModel.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if existing:
        return jsonify({
            'success': False, 
            'error': 'You already have an active subscription',
            'subscription': {
                'package_name': package.name,
                'end_date': existing.end_date.isoformat() if existing.end_date else None
            }
        }), 400
    
    # Create new subscription
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=package.duration_days)
    
    subscription = UserSubscriptionModel(
        user_id=user_id,
        package_id=package_id,
        status=SubscriptionStatus.ACTIVE,
        start_date=start_date,
        end_date=end_date
    )
    
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    
    return jsonify({
        'success': True,
        'message': 'Subscription activated successfully!',
        'subscription': {
            'sub_id': subscription.sub_id,
            'package_name': package.name,
            'status': 'active',
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'price': float(package.price) if package.price else 0
        }
    }), 200


@cm_subscription_bp.route('/subscriptions/my-subscription', methods=['GET'])
@token_required
def get_my_subscription():
    """
    Get current user's active subscription
    ---
    get:
      summary: Get my subscription status
      tags:
        - Subscriptions
      security:
        - BearerAuth: []
      responses:
        200:
          description: User subscription info
    """
    from infrastructure.models.careermate.user_subscription_model import UserSubscriptionModel, SubscriptionStatus
    from infrastructure.databases.connection import get_careermate_session
    
    current_user = request.current_user
    user_id = current_user.get('user_id')
    
    session = get_careermate_session()
    repo = SubscriptionRepository()
    
    # Get active subscription
    subscription = session.query(UserSubscriptionModel).filter(
        UserSubscriptionModel.user_id == user_id,
        UserSubscriptionModel.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        return jsonify({
            'success': True,
            'has_subscription': False,
            'plan': 'free'
        }), 200
    
    package = repo.get_package_by_id(subscription.package_id)
    
    return jsonify({
        'success': True,
        'has_subscription': True,
        'plan': 'premium',
        'subscription': {
            'sub_id': subscription.sub_id,
            'package_name': package.name if package else 'Unknown',
            'status': subscription.status.value if hasattr(subscription.status, 'value') else str(subscription.status),
            'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
            'end_date': subscription.end_date.isoformat() if subscription.end_date else None
        }
    }), 200
