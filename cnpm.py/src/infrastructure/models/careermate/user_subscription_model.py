from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum

class SubscriptionStatus(enum.Enum):
    ACTIVE = 'active'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'
    PENDING = 'pending'

class UserSubscriptionModel(Base):
    """User subscription linking users to packages."""
    __tablename__ = 'cm_user_subscriptions'
    __table_args__ = {'extend_existing': True}

    sub_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('cm_users.user_id'), nullable=False, index=True)
    package_id = Column(Integer, ForeignKey('cm_subscription_packages.package_id'), nullable=True)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.PENDING)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship('CMUserModel', back_populates='subscriptions')
    package = relationship('SubscriptionPackageModel', back_populates='user_subscriptions')

    def __repr__(self):
        return f"<UserSubscriptionModel(sub_id={self.sub_id}, user_id={self.user_id}, status='{self.status}')>"
