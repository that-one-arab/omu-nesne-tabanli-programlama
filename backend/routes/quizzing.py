import os
from flask import Blueprint, jsonify, request
from app import db, app
from werkzeug.utils import secure_filename
from util.index import allowed_file, get_file_extension, remove_files
from models import Quiz, Question, Answer, Subject, QuizAttempt, UserChoice
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from uuid import uuid4
import tasks

quizzing_blueprint = Blueprint("auth", __name__, url_prefix="/api")


# Get Subjects
@quizzing_blueprint.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    search_query = request.args.get("search_query")
    subjects = Subject.query.filter_by(created_by_id=current_user.id)
    if search_query:
        # escape any single or doble quotes in the search query
        search_query = search_query.replace("'", "").replace('"', "")
        subjects = subjects.filter(Subject.title.ilike(f"%{search_query}%"))
    subjects_data = [
        {"id": s.id, "title": s.title, "created_by_id": s.created_by_id}
        for s in subjects.all()
    ]
    return jsonify(subjects_data)


@quizzing_blueprint.route("/subjects/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    if subject.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify({"id": subject.id, "title": subject.title})


# Create Subject
@quizzing_blueprint.route("/subjects", methods=["POST"])
@jwt_required()
def create_subject():
    data = request.get_json()
    title = data.get("title")

    subject = Subject(title=title, created_by_id=current_user.id)
    db.session.add(subject)
    db.session.commit()

    return (
        jsonify({"message": "Subject created successfully!", "subject_id": subject.id}),
        201,
    )


# Edit Subject
@quizzing_blueprint.route("/subjects/<int:subject_id>", methods=["PUT"])
@jwt_required()
def edit_subject(subject_id):
    data = request.get_json()
    new_title = data.get("new_title")

    if not new_title:
        return jsonify({"error": "Key 'new_title' is required!"}), 400

    subject = Subject.query.get_or_404(subject_id)

    if subject.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    subject.title = new_title
    db.session.commit()

    return jsonify({"message": "Subject updated successfully!"}), 200


# Delete Subject
@quizzing_blueprint.route("/subjects/<int:subject_id>", methods=["DELETE"])
@jwt_required()
def delete_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    if subject.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(subject)
    db.session.commit()
    return (
        jsonify({"message": "Subject and related quizzes deleted successfully!"}),
        200,
    )


# Create Quiz
@quizzing_blueprint.route("/quizzes", methods=["POST"])
@jwt_required()
def create_quiz():
    print("Creating quiz")
    # Used for error handling and/or cleanup
    created_files_paths = []

    files = request.files.getlist("file")
    print("Files: ", files)

    data = request.form.to_dict()
    print("Data: ", data)

    subject_id = data.get("subject_id")
    title = data.get("title")
    success_percentage = data.get("success_percentage")
    description = data.get("description")
    duration = data.get("duration")
    number_of_questions = data.get("number_of_questions")
    number_of_questions = int(number_of_questions) if number_of_questions else 0

    print("Subject ID: ", subject_id)

    try:
        # Make sure the subject exists
        Subject.query.get_or_404(subject_id)
    except:
        return jsonify({"error": "Invalid subject id"}), 400

    if len(files) <= 0:
        return jsonify({"message": "No files part in the request"}), 400

    for file in files:
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if not file.filename:
            remove_files(created_files_paths)
            return jsonify({"message": "No selected file"}), 400

        if file and not allowed_file(file.filename):
            remove_files(created_files_paths)
            return (
                jsonify(
                    {
                        "error": "Invalid file extension, supported extensions are: "
                        + app.config["ALLOWED_EXTENSIONS"]
                    }
                ),
                400,
            )

    for file in files:
        if file:
            filename = secure_filename(file.filename)
            filename = str(uuid4()) + "." + get_file_extension(file.filename)

            file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

            file.save(file_path)
            created_files_paths.append(file_path)

    task = tasks.create_quiz.delay(
        current_user.id,
        subject_id,
        title,
        success_percentage,
        description,
        duration,
        number_of_questions,
        created_files_paths,
    )

    return jsonify({"task_id": task.id}), 202


# Get Quizzes
@quizzing_blueprint.route("/quizzes", methods=["GET"])
@jwt_required()
def get_quizzes():
    search_query = request.args.get("search_query")
    subject_id = request.args.get("subject_id")

    quizzes = Quiz.query.filter_by(created_by_id=current_user.id)

    if search_query:
        # escape any single or double quotes in the search query
        search_query = search_query.replace("'", "").replace('"', "")
        quizzes = Quiz.query.filter(
            Quiz.title.ilike(f"%{search_query}%")
            | Quiz.description.ilike(f"%{search_query}%")
        )

    if subject_id:
        quizzes = Quiz.query.filter_by(
            created_by_id=current_user.id, subject_id=subject_id
        )

    quizzes_data = [
        {
            "id": q.id,
            "subject_id": q.subject_id,
            "title": q.title,
            "success_percentage": q.success_percentage,
            "description": q.description,
            "duration": q.duration,
            "created_by_id": q.created_by_id,
        }
        for q in quizzes.all()
    ]
    return jsonify(quizzes_data)


# Get Quiz
@quizzing_blueprint.route("/quizzes/<int:quiz_id>", methods=["GET"])
@jwt_required()
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    if quiz.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify(
        {
            "id": quiz.id,
            "subject_id": quiz.subject_id,
            "title": quiz.title,
            "success_percentage": quiz.success_percentage,
            "description": quiz.description,
            "duration": quiz.duration,
            "questions": [
                {
                    "id": q.id,
                    "title": q.title,
                    "answers": [
                        {"id": a.id, "title": a.title, "is_correct": a.is_correct}
                        for a in q.answers
                    ],
                }
                for q in quiz.questions
            ],
        }
    )


# Delete Quiz
@quizzing_blueprint.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    if quiz.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({"message": "Quiz deleted successfully!"}), 200


# Create Quiz Attempt
@quizzing_blueprint.route("/quizzes/<int:quiz_id>/attempt", methods=["POST"])
@jwt_required()
def create_quiz_attempt(quiz_id):
    data = request.get_json()
    answered_questions = data.get("answered_questions")

    quiz = Quiz.query.get_or_404(quiz_id)
    quiz_attempt = QuizAttempt(quiz_id=quiz.id, result=0, did_pass=False)

    total_correct = 0
    for q in answered_questions:
        question_id = q["question_id"]
        choice_id = q["choice_id"]

        question = Question.query.get_or_404(question_id)
        answer = Answer.query.get_or_404(choice_id)

        if answer.question_id != question.id:
            return jsonify({"error": "Invalid choice for the question"}), 400

        quiz_attempt.answered_questions.append(
            UserChoice(question_id=question.id, choice_id=answer.id)
        )

        if answer.is_correct:
            total_correct += 1

    quiz_attempt.result = total_correct * 100 // len(quiz.questions)

    quiz_attempt.did_pass = quiz_attempt.result >= quiz.success_percentage

    db.session.add(quiz_attempt)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Quiz attempt created successfully!",
                "attempt_id": quiz_attempt.id,
            }
        ),
        201,
    )


# Get Quiz Attempt
@quizzing_blueprint.route(
    "/quizzes/<int:quiz_id>/attempt/<int:attempt_id>", methods=["GET"]
)
@jwt_required()
def get_quiz_attempt(quiz_id, attempt_id):
    quiz_attempt = QuizAttempt.query.get_or_404(attempt_id)
    if quiz_attempt.quiz_id != quiz_id:
        return jsonify({"error": "Invalid quiz attempt"}), 400

    if quiz_attempt.quiz.created_by_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    answered_questions = [
        {
            "question_id": q.question_id,
            "choice_id": q.choice_id,
            "is_correct": q.choice.is_correct,
        }
        for q in quiz_attempt.answered_questions
    ]

    return jsonify(
        {
            "id": quiz_attempt.id,
            "quiz_id": quiz_attempt.quiz_id,
            "result": quiz_attempt.result,
            "did_pass": quiz_attempt.did_pass,
            "success_percentage": quiz_attempt.quiz.success_percentage,
            "answered_questions": answered_questions,
        }
    )
