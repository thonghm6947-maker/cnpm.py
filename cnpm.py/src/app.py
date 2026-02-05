from flask import Flask, jsonify
from flask_swagger_ui import get_swaggerui_blueprint
from config import Config
from flasgger import Swagger
from config import SwaggerConfig
from cors import init_cors

# Import các module
from api.swagger import spec
from api.controllers.todo_controller import bp as todo_bp
from api.middleware import middleware
from infrastructure.databases import init_db

# CareerMate controllers
from api.controllers.careermate.auth_controller import cm_auth_bp
from api.controllers.careermate.job_controller import cm_job_bp
from api.controllers.careermate.profile_controller import cm_profile_bp
from api.controllers.careermate.recruiter_controller import cm_recruiter_bp
from api.controllers.careermate.admin_controller import cm_admin_bp
from api.controllers.careermate.ai_controller import cm_ai_bp
from api.controllers.careermate.subscription_controller import cm_subscription_bp


def create_app():
    app = Flask(__name__)
    
    # Load configuration from Config class
    app.config.from_object(Config)
    
    # Enable CORS for frontend connection
    init_cors(app)
    
    Swagger(app)
    
    # Đăng ký blueprint
    app.register_blueprint(todo_bp)
    
    # CareerMate API blueprints
    app.register_blueprint(cm_auth_bp)
    app.register_blueprint(cm_job_bp)
    app.register_blueprint(cm_profile_bp)
    app.register_blueprint(cm_recruiter_bp)
    app.register_blueprint(cm_admin_bp)
    app.register_blueprint(cm_ai_bp)  # AI Career Coach & CV Analyzer
    app.register_blueprint(cm_subscription_bp)  # Subscription Management
    
    # Thêm Swagger UI blueprint
    SWAGGER_URL = '/docs'
    API_URL = '/swagger.json'
    
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "CareerMate API",
            'layout': "BaseLayout"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # Khởi tạo Database
    try:
        init_db(app)
    except Exception as e:
        print(f"Error initializing database: {e}")

    # Đăng ký Middleware
    middleware(app)

    # Tự động cập nhật Swagger Spec từ các hàm trong Controller
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            if rule.endpoint.startswith(('todo.', 'course.', 'user.', 'cm_')):
                view_func = app.view_functions[rule.endpoint]
                spec.path(view=view_func)
            
    @app.route("/swagger.json")
    def swagger_json():
        return jsonify(spec.to_dict())

    return app

if __name__ == '__main__':
    app = create_app()
    # Chạy server
    app.run(host='0.0.0.0', port=9999, debug=True)