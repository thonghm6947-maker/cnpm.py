print("=" * 50)
print("CAREERMATE BACKEND - LOADING FRESH CODE v2.0")
print("=" * 50)

from flask import Flask, jsonify
from api.swagger import spec
from api.middleware import middleware
from api.responses import success_response
from api.controllers.todo_controller import bp as todo_bp
from infrastructure.databases import init_db
from config import Config
from flasgger import Swagger
from config import SwaggerConfig
from flask_swagger_ui import get_swaggerui_blueprint

# Import recruiter controller directly
try:
    from api.controllers.recruiter_controller import bp as recruiter_bp
    RECRUITER_BP_LOADED = True
except Exception as e:
    print(f"ERROR loading recruiter_controller: {e}")
    RECRUITER_BP_LOADED = False
    recruiter_bp = None


def create_app():
    app = Flask(__name__)
    Swagger(app)
    
    # Đăng ký blueprint
    app.register_blueprint(todo_bp)
    if RECRUITER_BP_LOADED and recruiter_bp:
        app.register_blueprint(recruiter_bp)
        print("Recruiter blueprint registered successfully")
    else:
        print("WARNING: Recruiter blueprint NOT registered")

    # Debug route to see all routes
    @app.route('/api/debug/routes')
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({'endpoint': rule.endpoint, 'methods': list(rule.methods), 'path': rule.rule})
        return jsonify({'routes': routes, 'recruiter_loaded': RECRUITER_BP_LOADED})

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
            if rule.endpoint.startswith(('todo.', 'course.', 'user.', 'recruiter.')):
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