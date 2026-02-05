from sqlalchemy import Column, Integer, String, Unicode, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class ChatSessionModel(Base):
    """Chat session with AI assistant."""
    __tablename__ = 'cm_chat_sessions'
    __table_args__ = {'extend_existing': True}

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('cm_users.user_id'), nullable=False, index=True)
    topic = Column(Unicode(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("CMUserModel", back_populates="chat_sessions")
    messages = relationship("ChatMessageModel", back_populates="session", order_by="ChatMessageModel.sent_at")

    def __repr__(self):
        return f"<ChatSessionModel(session_id={self.session_id}, topic='{self.topic}')>"
