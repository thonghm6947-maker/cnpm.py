from typing import Optional, List
from sqlalchemy import func
from infrastructure.databases.factory_database import FactoryDatabase
from infrastructure.models.careermate.subscription_package_model import SubscriptionPackageModel
from infrastructure.models.careermate.user_subscription_model import UserSubscriptionModel, SubscriptionStatus


class SubscriptionRepository:
    """Repository for subscription package operations."""
    
    def __init__(self):
        self.session = FactoryDatabase.get_database('MSSQL').session
    
    def get_all_packages(self) -> List[SubscriptionPackageModel]:
        """Get all subscription packages."""
        return self.session.query(SubscriptionPackageModel).all()
    
    def get_package_by_id(self, package_id: int) -> Optional[SubscriptionPackageModel]:
        """Get a package by ID."""
        return self.session.query(SubscriptionPackageModel).filter_by(package_id=package_id).first()
    
    def create_package(self, data: dict) -> SubscriptionPackageModel:
        """Create a new subscription package."""
        package = SubscriptionPackageModel(
            name=data.get('name'),
            price=data.get('price'),
            duration_days=data.get('duration_days', 30),
            description=data.get('description')
        )
        self.session.add(package)
        self.session.commit()
        self.session.refresh(package)
        return package
    
    def update_package(self, package_id: int, data: dict) -> Optional[SubscriptionPackageModel]:
        """Update a subscription package."""
        package = self.get_package_by_id(package_id)
        if not package:
            return None
        
        if 'name' in data:
            package.name = data['name']
        if 'price' in data:
            package.price = data['price']
        if 'duration_days' in data:
            package.duration_days = data['duration_days']
        if 'description' in data:
            package.description = data['description']
        
        self.session.commit()
        self.session.refresh(package)
        return package
    
    def delete_package(self, package_id: int) -> bool:
        """Delete a subscription package."""
        package = self.get_package_by_id(package_id)
        if not package:
            return False
        
        self.session.delete(package)
        self.session.commit()
        return True
    
    def get_package_subscriber_count(self, package_id: int) -> int:
        """Get number of active subscribers for a package."""
        return self.session.query(UserSubscriptionModel).filter(
            UserSubscriptionModel.package_id == package_id,
            UserSubscriptionModel.status == SubscriptionStatus.ACTIVE
        ).count()
    
    def get_all_packages_with_stats(self) -> List[dict]:
        """Get all packages with subscriber counts."""
        packages = self.get_all_packages()
        result = []
        for pkg in packages:
            subscribers = self.get_package_subscriber_count(pkg.package_id)
            result.append({
                'package_id': pkg.package_id,
                'name': pkg.name,
                'price': float(pkg.price) if pkg.price else 0,
                'duration_days': pkg.duration_days,
                'description': pkg.description,
                'subscribers': subscribers,
                'created_at': pkg.created_at.isoformat() if pkg.created_at else None,
                'updated_at': pkg.updated_at.isoformat() if pkg.updated_at else None
            })
        return result
    
    def get_subscription_stats(self) -> dict:
        """Get overall subscription statistics."""
        # Total subscribers (all statuses)
        total_subscribers = self.session.query(UserSubscriptionModel).count()
        
        # Active subscribers
        active_subscribers = self.session.query(UserSubscriptionModel).filter(
            UserSubscriptionModel.status == SubscriptionStatus.ACTIVE
        ).count()
        
        # Total revenue from active subscriptions
        revenue_query = self.session.query(
            func.sum(SubscriptionPackageModel.price)
        ).join(
            UserSubscriptionModel,
            UserSubscriptionModel.package_id == SubscriptionPackageModel.package_id
        ).filter(
            UserSubscriptionModel.status == SubscriptionStatus.ACTIVE
        ).scalar()
        
        total_revenue = float(revenue_query) if revenue_query else 0
        
        # MRR (Monthly Recurring Revenue) - simplified calculation
        mrr = total_revenue  # In real app, normalize to monthly
        
        return {
            'total_subscribers': total_subscribers,
            'active_subscribers': active_subscribers,
            'total_revenue': total_revenue,
            'mrr': mrr
        }
