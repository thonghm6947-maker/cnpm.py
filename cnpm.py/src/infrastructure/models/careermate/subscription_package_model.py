from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime

class SubscriptionPackageModel(Base):
    """Subscription package definitions."""
    __tablename__ = 'cm_subscription_packages'
    __table_args__ = {'extend_existing': True}

    package_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    duration_days = Column(Integer, nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_subscriptions = relationship('UserSubscriptionModel', back_populates='package')

    def __repr__(self):
        return f"<SubscriptionPackageModel(package_id={self.package_id}, name='{self.name}')>"
