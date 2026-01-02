# Constants

# Define any constants used throughout the application here. 
# For example, you might define API version, error messages, or configuration keys.

API_VERSION = "v1"
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Add more constants as needed for your application.
class Role:
    ADMIN = "admin"
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"

class JobStatus:
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"

class ApplicationStatus:
    PENDING = "pending"
    REVIEWED = "reviewed"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    HIRED = "hired"