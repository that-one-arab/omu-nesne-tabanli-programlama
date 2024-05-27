from flask import Blueprint, jsonify, request
from app import db, bcrypt
from models import User
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user


user_blueprint = Blueprint("user", __name__, url_prefix="/api")


# Change the password of the current user
@user_blueprint.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return (
            jsonify({"error": "Keys 'old_password' and 'new_password' are required!"}),
            400,
        )

    user = User.query.get_or_404(current_user.id)

    if not bcrypt.check_password_hash(user.password, old_password):
        return jsonify({"error": "Invalid password"}), 400

    hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password changed successfully!"}), 200


# Change the email of the current user
@user_blueprint.route("/change-email", methods=["PUT"])
@jwt_required()
def change_email():
    data = request.get_json()
    new_email = data.get("new_email")

    if not new_email:
        return jsonify({"error": "Key 'new_email' is required!"}), 400

    # Check if the new email is already taken
    if User.query.filter_by(email=new_email).first():
        return jsonify({"error": "Email already taken!"}), 400

    user = User.query.get_or_404(current_user.id)
    user.email = new_email
    db.session.commit()

    return jsonify({"message": "Email changed successfully!"}), 200


# Change the username of the current user
@user_blueprint.route("/change-username", methods=["PUT"])
@jwt_required()
def change_username():
    data = request.get_json()
    new_username = data.get("new_username")

    if not new_username:
        return jsonify({"error": "Key 'new_username' is required!"}), 400

    # Check if the new username is already taken
    if User.query.filter_by(username=new_username).first():
        return jsonify({"error": "Username already taken!"}), 400

    user = User.query.get_or_404(current_user.id)
    user.username = new_username
    db.session.commit()

    return jsonify({"message": "Username changed successfully!"}), 200


# Change the name of the current user
@user_blueprint.route("/change-name", methods=["PUT"])
@jwt_required()
def change_name():
    data = request.get_json()
    new_name = data.get("new_name")

    if not new_name:
        return jsonify({"error": "Key 'new_name' is required!"}), 400

    user = User.query.get_or_404(current_user.id)
    user.name = new_name
    db.session.commit()

    return jsonify({"message": "Name changed successfully!"}), 200


@user_blueprint.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user = User.query.get_or_404(current_user.id)
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account deleted successfully!"}), 200
