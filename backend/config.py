from dotenv import load_dotenv

load_dotenv()

import os


class Config(object):
    SECRET_KEY = os.environ.get("SECRET_KEY") or "you-will-never-guess"
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or "postgresql://postgres:mysecretpassword@localhost:5432/exam-buddy"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-secret-key"
    SQLALCHEMY_ECHO = False  # Set to True to see SQL queries output in the console
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER") or "/uploads"
    ALLOWED_EXTENSIONS = {"pdf"}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB limit
