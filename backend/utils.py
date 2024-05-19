from datetime import datetime
from sqlalchemy import Column, DateTime, event
from app import db


class BaseModel(db.Model):
    __abstract__ = True  # This ensures the class is not created as a table

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    modified_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    @staticmethod
    def set_created_at(mapper, connection, target):
        if not target.created_at:
            target.created_at = datetime.utcnow()

    @staticmethod
    def set_modified_at(mapper, connection, target):
        target.modified_at = datetime.utcnow()

    @classmethod
    def __declare_last__(cls):
        event.listen(cls, "before_insert", cls.set_created_at)
        event.listen(cls, "before_update", cls.set_modified_at)
