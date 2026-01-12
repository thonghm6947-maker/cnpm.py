from flask import Flask, jsonify
from flask_swagger_ui import get_swaggerui_blueprint
from config import Config

# Import các module (Đảm bảo chỉ import những gì bạn ĐANG CÓ)
from api.swagger import spec
from api.controllers.todo_controller import bp as todo_bp
from api.middleware import middleware
from infrastructure.databases import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 1. Đăng ký Blueprints (Chỉ đăng ký Todo)
    app.register_blueprint(todo_bp)

    # 2. Cấu hình Swagger UI
    # Giao diện sẽ hiển thị tại đường dẫn /docs
    SWAGGER_URL = '/docs'
    API_URL = '/swagger.json'
    
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Todo API",
            'layout': "BaseLayout"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # 3. Khởi tạo Database
    try:
        init_db(app)
    except Exception as e:
        print(f"Error initializing database: {e}")

    # 4. Đăng ký Middleware
    middleware(app)

    # 5. Tự động cập nhật Swagger Spec từ các hàm trong Controller
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            # Chỉ quét các endpoint bắt đầu bằng 'todo.' (hoặc course/user nếu có)
            if rule.endpoint.startswith(('todo.', 'course.', 'user.')):
                view_func = app.view_functions[rule.endpoint]
                spec.path(view=view_func)

    # 6. Route trả về nội dung file JSON cho Swagger đọc
    @app.route("/swagger.json")
    def swagger_json():
        return jsonify(spec.to_dict())

    return app

if __name__ == '__main__':
    app = create_app()
    # Chạy server
    app.run(host='0.0.0.0', port=9999, debug=True)