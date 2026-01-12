# CareerMate API Schemas
from marshmallow import Schema, fields, validate


# ============ Auth Schemas ============
class RegisterRequestSchema(Schema):
    """Schema for user registration request."""
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    password_confirm = fields.Str(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(['candidate', 'recruiter']))
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    # Optional fields for profile
    phone = fields.Str(required=False)
    company_name = fields.Str(required=False)  # For recruiters


class RegisterResponseSchema(Schema):
    """Schema for user registration response."""
    user_id = fields.Int()
    email = fields.Email()
    role = fields.Str()
    message = fields.Str()


class LoginRequestSchema(Schema):
    """Schema for user login request."""
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class LoginResponseSchema(Schema):
    """Schema for user login response."""
    access_token = fields.Str()
    token_type = fields.Str()
    user = fields.Nested('UserResponseSchema')


class UserResponseSchema(Schema):
    """Schema for user info response."""
    user_id = fields.Int()
    email = fields.Email()
    role = fields.Str()
    is_active = fields.Bool()


# ============ Profile Schemas ============
class CandidateProfileSchema(Schema):
    """Schema for candidate profile."""
    candidate_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    full_name = fields.Str(required=True)
    phone = fields.Str()
    bio = fields.Str()
    avatar_url = fields.Str()


class RecruiterProfileSchema(Schema):
    """Schema for recruiter profile."""
    recruiter_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    full_name = fields.Str(required=True)
    phone = fields.Str()
    position = fields.Str()
    company_id = fields.Int()


class CompanySchema(Schema):
    """Schema for company."""
    company_id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    website = fields.Str()
    logo_url = fields.Str()
    location = fields.Str()


# ============ Job Schemas ============
class JobPostSchema(Schema):
    """Schema for job post."""
    job_id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str()
    salary_min = fields.Decimal()
    salary_max = fields.Decimal()
    location = fields.Str()
    job_type = fields.Str()
    deadline = fields.DateTime()
    status = fields.Str()
    company_id = fields.Int()
    recruiter_id = fields.Int()


class JobApplicationSchema(Schema):
    """Schema for job application."""
    app_id = fields.Int(dump_only=True)
    job_id = fields.Int(required=True)
    resume_id = fields.Int()
    cover_letter = fields.Str()
    status = fields.Str(dump_only=True)
    ai_match_score = fields.Decimal(dump_only=True)
    applied_at = fields.DateTime(dump_only=True)


# ============ Resume Schemas ============
class ResumeSchema(Schema):
    """Schema for resume."""
    resume_id = fields.Int(dump_only=True)
    candidate_id = fields.Int(dump_only=True)
    file_url = fields.Str()
    file_name = fields.Str()
    is_primary = fields.Bool()


class CVAnalysisSchema(Schema):
    """Schema for CV analysis."""
    analysis_id = fields.Int(dump_only=True)
    resume_id = fields.Int()
    ats_score = fields.Decimal()
    feedback = fields.Str()
    missing_skills = fields.Str()
    strengths = fields.Str()


# ============ AI Schemas ============
class CVAnalyzeRequestSchema(Schema):
    """Schema for CV analysis request."""
    resume_id = fields.Int(required=False)
    cv_text = fields.Str(required=False)
    job_description = fields.Str(required=False)
    target_role = fields.Str(required=False)


class CVAnalyzeResponseSchema(Schema):
    """Schema for CV analysis response."""
    ats_score = fields.Float()
    strengths = fields.List(fields.Str())
    missing_skills = fields.List(fields.Str())
    feedback = fields.Str()
    recommendations = fields.List(fields.Str())


class CareerCoachMessageRequestSchema(Schema):
    """Schema for career coach chat message request."""
    message = fields.Str(required=True, validate=validate.Length(min=1))
    session_id = fields.Int(required=False)
    topic = fields.Str(required=False)


class CareerCoachMessageResponseSchema(Schema):
    """Schema for career coach chat message response."""
    session_id = fields.Int()
    user_message = fields.Dict()
    ai_response = fields.Dict()


class ChatSessionSchema(Schema):
    """Schema for chat session."""
    session_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    topic = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    message_count = fields.Int(dump_only=True)


class ChatMessageResponseSchema(Schema):
    """Schema for chat message response."""
    msg_id = fields.Int(dump_only=True)
    sender = fields.Str()
    content = fields.Str()
    sent_at = fields.Str()


class CareerRoadmapRequestSchema(Schema):
    """Schema for career roadmap generation request."""
    target_role = fields.Str(required=True, validate=validate.Length(min=2))
    current_role = fields.Str(required=False)
    current_skills = fields.List(fields.Str(), required=False)
    time_frame = fields.Str(required=False, load_default="12 months")


class CareerRoadmapResponseSchema(Schema):
    """Schema for career roadmap response."""
    roadmap_id = fields.Int()
    title = fields.Str()
    target_role = fields.Str()
    estimated_duration = fields.Str()
    phases = fields.List(fields.Dict())
    summary = fields.Str()

