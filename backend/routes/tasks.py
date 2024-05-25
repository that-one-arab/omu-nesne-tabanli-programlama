from flask import Blueprint
from celery.result import AsyncResult

tasks_blueprint = Blueprint("tasks", __name__, url_prefix="/api")


@tasks_blueprint.get("/result/<id>")
def task_result(id: str) -> dict[str, object]:
    result = AsyncResult(id)
    return {
        "ready": result.ready(),
        "successful": result.successful(),
        "value": result.result if result.ready() else None,
    }
