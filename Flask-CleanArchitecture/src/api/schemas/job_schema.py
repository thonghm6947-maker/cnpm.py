from marshmallow import Schema, fields, validate

class JobSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(required=True)
    requirements = fields.Str(required=True)
    location = fields.Str(required=True)
    salary_range = fields.Str(required=True)
    job_type = fields.Str(validate=validate.OneOf(["Full-time", "Part-time", "Contract", "Remote", "Freelance"]))
    status = fields.Str(dump_only=True)
    reject_reason = fields.Str(dump_only=True)
    recruiter_id = fields.Int(dump_only=True)
    application_count = fields.Int(dump_only=True)
    view_count = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class JobRequestSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(required=True)
    requirements = fields.Str(required=True)
    location = fields.Str(required=True)
    salary_range = fields.Str(required=True)
    job_type = fields.Str(validate=validate.OneOf(["Full-time", "Part-time", "Contract", "Remote", "Freelance"]))
    status = fields.Str(validate=validate.OneOf(["draft", "pending", "active", "closed"]))
