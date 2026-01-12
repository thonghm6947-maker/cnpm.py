from infrastructure.models.job_model import JobModel
from infrastructure.databases.mssql import session
from sqlalchemy.orm import Session
from typing import Optional, List

class JobRepository:
    def __init__(self, session: Session = session):
        self.session = session

    def get_by_id(self, job_id: int) -> Optional[JobModel]:
        return self.session.query(JobModel).filter_by(id=job_id).first()

    def list(self, status: str = None, recruiter_id: int = None) -> List[JobModel]:
        query = self.session.query(JobModel)
        if status:
            query = query.filter(JobModel.status == status)
        if recruiter_id:
            query = query.filter(JobModel.recruiter_id == recruiter_id)
        return query.order_by(JobModel.created_at.desc()).all()

    def add(self, job: JobModel) -> JobModel:
        try:
            self.session.add(job)
            self.session.commit()
            self.session.refresh(job)
            return job
        except Exception as e:
            self.session.rollback()
            raise e

    def update(self, job: JobModel) -> JobModel:
        try:
            self.session.merge(job)
            self.session.commit()
            return job
        except Exception as e:
            self.session.rollback()
            raise e

    def delete(self, job_id: int) -> bool:
        try:
            job = self.get_by_id(job_id)
            if job:
                self.session.delete(job)
                self.session.commit()
                return True
            return False
        except Exception as e:
            self.session.rollback()
            raise e
