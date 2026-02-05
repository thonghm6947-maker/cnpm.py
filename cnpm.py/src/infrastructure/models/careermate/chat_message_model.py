from sqlalchemy import Column, Integer, String, UnicodeText, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum


class SenderType(enum.Enum):
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


class ChatMessageModel(Base):
    """Individual message in a chat session."""
    __tablename__ = 'cm_chat_messages'
    __table_args__ = {'extend_existing': True}

    msg_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey('cm_chat_sessions.session_id'), nullable=False, index=True)
    sender = Column(Enum(SenderType), nullable=False)
    content = Column(UnicodeText, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("ChatSessionModel", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessageModel(msg_id={self.msg_id}, sender='{self.sender}')>"
