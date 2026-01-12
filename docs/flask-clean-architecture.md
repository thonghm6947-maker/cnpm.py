# Flask Clean Architecture - Tài liệu Kiến trúc

> Cập nhật lần cuối: 12/01/2026

## Tổng quan Kiến trúc

Dự án này tuân theo mô hình **Clean Architecture** với các layer được phân tách rõ ràng:

```bash
├── src
│   ├── api/controllers/         # API Layer - Xử lý HTTP request/response
│   ├── services/                # Service Layer - Business logic
│   ├── domain/models/           # Domain Layer - Entities và Interfaces
│   ├── infrastructure/
│   │   ├── models/              # Database models (ORM)
│   │   └── repositories/        # Data access layer
│   ├── app.py                   # Entry point
│   └── config.py                # Configuration
```

---

## 1. API Layer (Controllers)

Tầng này nhận HTTP requests và trả về responses. Mỗi controller tương ứng với một module chức năng.

### Controllers Cơ bản
| File | Mô tả |
|------|-------|
| `auth_controller.py` | Xác thực người dùng (đăng nhập, đăng ký) |
| `course_controller.py` | Quản lý khóa học |
| `todo_controller.py` | Quản lý công việc |

### Controllers CareerMate (`api/controllers/careermate/`)
| File | Mô tả |
|------|-------|
| `auth_controller.py` | Xác thực CareerMate (JWT token) |
| `job_controller.py` | Tìm kiếm việc làm, ứng tuyển |
| `profile_controller.py` | Quản lý hồ sơ ứng viên |
| `recruiter_controller.py` | Chức năng nhà tuyển dụng |
| `admin_controller.py` | Quản trị hệ thống (duyệt tin, quản lý user) |

---

## 2. Services Layer

Chứa business logic, xử lý nghiệp vụ giữa Controller và Repository.

### Services Cơ bản
| File | Mô tả |
|------|-------|
| `auth_service.py` | Logic xác thực |
| `course_service.py` | Logic quản lý khóa học |
| `todo_service.py` | Logic quản lý công việc |

### Services CareerMate (`services/careermate/`)
| File | Mô tả |
|------|-------|
| `auth_service.py` | Đăng ký, đăng nhập, tạo JWT token |
| `job_service.py` | Tạo/sửa/xóa tin tuyển dụng, ứng tuyển |
| `profile_service.py` | Cập nhật hồ sơ ứng viên |

---

## 3. Domain Layer

Định nghĩa các **Entities** (đối tượng nghiệp vụ) và **Interfaces** (Repository contracts).

### Entities (`domain/models/`)
| File | Mô tả |
|------|-------|
| `auth.py` | Entity người dùng xác thực |
| `careermate.py` | Entities cho CareerMate |
| `course.py` | Entity khóa học |
| `todo.py` | Entity công việc |
| `user.py` | Entity người dùng |

### Repository Interfaces
| File | Mô tả |
|------|-------|
| `iauth_repository.py` | Interface repository xác thực |
| `icareermate_repository.py` | Interface repository CareerMate |
| `icourse_repository.py` | Interface repository khóa học |
| `itodo_repository.py` | Interface repository công việc |

---

## 4. Infrastructure Layer

### 4.1 Database Models (`infrastructure/models/`)

ORM models ánh xạ class Python → Table CSDL.

#### Models Cơ bản
| File | Table | Mô tả |
|------|-------|-------|
| `user_model.py` | `users` | Người dùng hệ thống |
| `course_model.py` | `courses` | Khóa học |
| `todo_model.py` | `todos` | Công việc |

#### Models CareerMate (`infrastructure/models/careermate/`)
| File | Table | Mô tả |
|------|-------|-------|
| `user_model.py` | `cm_users` | Người dùng CareerMate |
| `job_post_model.py` | `cm_job_posts` | Tin tuyển dụng |
| `job_application_model.py` | `cm_job_applications` | Đơn ứng tuyển |
| `candidate_profile_model.py` | `cm_candidate_profiles` | Hồ sơ ứng viên |
| `recruiter_profile_model.py` | `cm_recruiter_profiles` | Hồ sơ nhà tuyển dụng |
| `company_model.py` | `cm_companies` | Công ty |
| `skill_model.py` | `cm_skills` | Kỹ năng |
| `candidate_skill_model.py` | `cm_candidate_skills` | Kỹ năng ứng viên |
| `job_skill_model.py` | `cm_job_skills` | Kỹ năng yêu cầu |
| `resume_model.py` | `cm_resumes` | CV/Resume |
| `saved_job_model.py` | `cm_saved_jobs` | Tin đã lưu |
| `cv_analysis_model.py` | `cm_cv_analyses` | Phân tích CV |
| `career_roadmap_model.py` | `cm_career_roadmaps` | Lộ trình nghề nghiệp |
| `chat_session_model.py` | `cm_chat_sessions` | Phiên chat AI |
| `chat_message_model.py` | `cm_chat_messages` | Tin nhắn chat |
| `subscription_package_model.py` | `cm_subscription_packages` | Gói đăng ký |
| `user_subscription_model.py` | `cm_user_subscriptions` | Đăng ký người dùng |

### 4.2 Repositories (`infrastructure/repositories/`)

Thực hiện truy xuất dữ liệu (CRUD operations).

#### Repositories Cơ bản
| File | Mô tả |
|------|-------|
| `auth_repository.py` | Truy xuất xác thực |
| `course_repository.py` | Truy xuất khóa học |
| `todo_repository.py` | Truy xuất công việc |
| `user_repository.py` | Truy xuất người dùng |

#### Repositories CareerMate (`infrastructure/repositories/careermate/`)
| File | Mô tả |
|------|-------|
| `user_repository.py` | CRUD user CareerMate |
| `job_repository.py` | CRUD tin tuyển dụng |

---

## 5. Luồng Request

```
HTTP Request
    ↓
Controller (API Layer)
    ↓
Service (Business Logic)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Infrastructure)
    ↓
Database Model (ORM)
    ↓
Database
```

---

## 6. Cấu hình & Khởi chạy

| File | Mô tả |
|------|-------|
| `app.py` | Entry point, khởi động Flask app |
| `config.py` | Cấu hình database, JWT, CORS |
| `create_app.py` | Factory pattern tạo app |
| `dependency_container.py` | Dependency Injection container |
| `error_handler.py` | Xử lý lỗi toàn cục |
| `cors.py` | Cấu hình CORS |

---

## 7. Ghi chú Triển khai

- **ORM**: Sử dụng SQLAlchemy để ánh xạ Python class → Table CSDL
- **Authentication**: JWT token với thư viện `PyJWT`
- **API Documentation**: Swagger UI tại `/docs`
- **Database**: Hỗ trợ SQLite (development) và SQL Server (production)