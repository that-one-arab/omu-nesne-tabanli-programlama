from celery import shared_task
from typing import List
from models import Quiz, Question, Answer
from app import db
from util.index import remove_files
from util.quizgpt.index import QuizGPT


@shared_task(ignore_result=False)
def add_together(a: int, b: int) -> int:
    return a + b


@shared_task(ignore_result=False)
def create_quiz(
    user_id: int,
    subject_id: int,
    title: str,
    success_percentage: int,
    description: str,
    duration: int,
    number_of_questions: int,
    created_files_paths: List[str],
):
    quiz = Quiz(
        subject_id=subject_id,
        title=title,
        success_percentage=success_percentage,
        description=description,
        duration=duration,
        created_by_id=user_id,
    )

    try:
        quiz_gpt = QuizGPT(files=created_files_paths)
        questions, response_code, response_message = quiz_gpt.generate_questions(
            num_questions=number_of_questions
        )

        # If no questions were generated
        if len(questions) <= 0:
            remove_files(created_files_paths)
            return {
                "message": "Error during quiz creation",
                "quiz_id": None,
                "details": {
                    "response_message": response_message,
                    "response_code": response_code,
                },
            }

        # Save the questions and answers to the database
        for q in questions:
            question = Question(title=q.title)
            for a in q.answers:
                answer = Answer(title=a.title, is_correct=a.is_correct)
                question.answers.append(answer)
            quiz.questions.append(question)

        db.session.add(quiz)
        db.session.commit()
        remove_files(created_files_paths)

        return {
            "message": "Quiz created successfully.",
            "quiz_id": quiz.id,
            "details": {
                "response_message": response_message,
                "response_code": response_code,
            },
        }

    except Exception as e:
        remove_files(created_files_paths)
        raise Exception(e)
