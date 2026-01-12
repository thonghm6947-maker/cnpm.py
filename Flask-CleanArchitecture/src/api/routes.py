from api.controllers.todo_controller import bp as todo_bp
from api.controllers.recruiter_controller import bp as recruiter_bp

def register_routes(app):
    app.register_blueprint(todo_bp)
    app.register_blueprint(recruiter_bp) 