from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from config import Config
from celery_util import celery_init_app

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

celery_app = celery_init_app(app)
celery_app.autodiscover_tasks()

# Initialize the database
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Import models and routes
from models import User, Answer, Question, Subject, Quiz, UserChoice, QuizAttempt


# Register a callback function that takes whatever object is passed in as the
# identity when creating JWTs and converts it to a JSON serializable format.
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user["id"]


# Register a callback function that loads a user from your database whenever
# a protected route is accessed. This should return any python object on a
# successful lookup, or None if the lookup failed for any reason (for example
# if the user has been deleted from the database).
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()


# Import blueprints
from routes.auth import auth_blueprint
from routes.user import user_blueprint
from routes.quizzing import quizzing_blueprint
from routes.tasks import tasks_blueprint

# Register blueprints
# Blueprint for the API (root URL: /api)
api_blueprint = Blueprint("api", __name__)

# Register the blueprints with the root API blueprint
api_blueprint.register_blueprint(auth_blueprint, url_prefix="/auth")
api_blueprint.register_blueprint(user_blueprint, url_prefix="/user")
api_blueprint.register_blueprint(quizzing_blueprint, url_prefix="/quizzing")
api_blueprint.register_blueprint(tasks_blueprint, url_prefix="/tasks")

# Register the root API blueprint with the app
app.register_blueprint(api_blueprint, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
