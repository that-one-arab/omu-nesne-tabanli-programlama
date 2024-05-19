from app import db
from sqlalchemy.orm import relationship
from utils import BaseModel


class User(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password = db.Column(db.String(248))


class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"), nullable=False)


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    answers = relationship("Answer", backref="question", cascade="all, delete-orphan")


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_by = relationship("User", backref="subjects")


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    success_percentage = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(1024))
    duration = db.Column(db.Integer, nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_by = relationship("User", backref="quizzes")
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=False)
    subject = relationship("Subject", backref="quizzes")
    questions = relationship("Question", backref="quiz", cascade="all, delete-orphan")


class UserChoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"), nullable=False)
    choice_id = db.Column(db.Integer, db.ForeignKey("answer.id"), nullable=False)
    quiz_attempt_id = db.Column(
        db.Integer, db.ForeignKey("quiz_attempt.id"), nullable=False
    )
    question = relationship("Question", backref="user_choices")
    choice = relationship("Answer", backref="user_choices")


class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    quiz = relationship("Quiz", backref="attempts")
    result = db.Column(db.Integer, nullable=False)
    did_pass = db.Column(db.Boolean, nullable=False)
    answered_questions = relationship(
        "UserChoice", backref="quiz_attempt", cascade="all, delete-orphan"
    )
