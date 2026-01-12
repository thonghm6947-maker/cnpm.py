from flask import Flask, jsonify
# from api.routes import register_routes
from api.swagger import spec
from api.controllers.todo_controller import bp as todo_bp
from api.controllers.auth_controller import auth_bp as auth_bp
from api.middleware import middleware
from api.responses import success_response
from infrastructure.databases import init_db
from config import Config
from flasgger import Swagger
from config import SwaggerConfig
from flask_swagger_ui import get_swaggerui_blueprint
from cors import init_cors

# CareerMate controllers
from api.controllers.careermate.auth_controller import cm_auth_bp
from api.controllers.careermate.job_controller import cm_job_bp
from api.controllers.careermate.profile_controller import cm_profile_bp
from api.controllers.careermate.recruiter_controller import cm_recruiter_bp
from api.controllers.careermate.admin_controller import cm_admin_bp
from api.controllers.careermate.ai_controller import cm_ai_bp


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for frontend connection
    init_cors(app)
    
    Swagger(app)
    # Đăng ký blueprint trước
    app.register_blueprint(todo_bp)
    app.register_blueprint(auth_bp)
    
    # CareerMate API blueprints
    app.register_blueprint(cm_auth_bp)
    app.register_blueprint(cm_job_bp)
    app.register_blueprint(cm_profile_bp)
    app.register_blueprint(cm_recruiter_bp)
    app.register_blueprint(cm_admin_bp)
    app.register_blueprint(cm_ai_bp)  # AI Career Coach & CV Analyzer
    
    # register_routes(app)
     # Thêm Swagger UI blueprint
    SWAGGER_URL = '/docs'
    API_URL = '/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={'app_name': "Todo API"}
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    try:
        init_db(app)
    except Exception as e:
        print(f"Error initializing database: {e}")

    # Register middleware
    middleware(app)

    # Register routes
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            # Thêm các endpoint khác nếu cần
            if rule.endpoint.startswith(('todo.', 'course.', 'user.', 'auth.')):
                view_func = app.view_functions[rule.endpoint]
                print(f"Adding path: {rule.rule} -> {view_func}")
                spec.path(view=view_func)
            
    @app.route("/swagger.json")
    def swagger_json():
        return jsonify(spec.to_dict())

    return app
# Run the application

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=9999, debug=True)