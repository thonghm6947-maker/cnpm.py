from src.api.controllers.todo_controller import bp as todo_bp

def register_routes(app):
    app.register_blueprint(todo_bp) 