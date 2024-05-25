from flask import Blueprint, jsonify, request
from app import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_blueprint = Blueprint("quizzing", __name__, url_prefix="/api")


@auth_blueprint.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if (
        User.query.filter_by(username=username).first()
        or User.query.filter_by(email=email).first()
    ):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(name=name, username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@auth_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(
            identity={"id": user.id, "username": user.username, "email": user.email},
            expires_delta=timedelta(days=2),
        )
        return (
            jsonify(
                {
                    "id": user.id,
                    "name": user.name,
                    "username": user.username,
                    "email": user.email,
                    "access_token": access_token,
                }
            ),
            200,
        )

    return jsonify({"message": "Invalid credentials"}), 401
