from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize the database
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Import models and routes
from models import User, Answer, Question, Subject, Quiz, UserChoice, QuizAttempt


# Import blueprints
from routes.auth import auth_blueprint
from routes.quizzing import quizzing_blueprint

# Register blueprints
# Blueprint for the API (root URL: /api)
api_blueprint = Blueprint("api", __name__)

# Register the blueprints with the root API blueprint
api_blueprint.register_blueprint(auth_blueprint, url_prefix="/auth")
api_blueprint.register_blueprint(quizzing_blueprint, url_prefix="/quizzing")

# Register the root API blueprint with the app
app.register_blueprint(api_blueprint, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
