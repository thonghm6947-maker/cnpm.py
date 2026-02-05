# CareerMate - Flask Backend

Backend API cho ứng dụng CareerMate sử dụng Flask với Clean Architecture.

##  Yêu cầu hệ thống

- Python 3.9+
- pip (Python package manager)

##  Cài đặt

### 1. Clone project và di chuyển vào thư mục src

```bash
cd src
```

### 2. Tạo virtual environment (khuyến nghị)

```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

### 3. Cài đặt tất cả dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình environment

Sao chép file `.env.example` thành `.env` và cập nhật:

```bash
copy .env.example .env
```

Sau đó mở file `.env` và cập nhật các thông tin cần thiết:

```env
# Flask Configuration
SECRET_KEY=your_secret_key_here
DEBUG=True

# LLM Provider: ollama, groq, or gemini
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth (lấy từ Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Chạy ứng dụng

```bash
python app.py
```

Server sẽ chạy tại: `http://localhost:9999`

API Documentation: `http://localhost:9999/docs`

---

##  Danh sách Dependencies

| Package | Mô tả |
|---------|-------|
| Flask | Web framework |
| Flask-Cors | Xử lý CORS |
| Flask-SQLAlchemy | ORM cho database |
| SQLAlchemy | SQL toolkit |
| marshmallow | Serialization/validation |
| pymssql | MS SQL Server driver |
| python-dotenv | Load .env file |
| Flask-RESTX | REST API extension |
| flasgger | Swagger UI |
| apispec | API specification |
| google-generativeai | Google Gemini AI |
| PyPDF2 | Đọc file PDF |
| python-docx | Đọc file Word |
| Authlib | OAuth library |
| httpx | HTTP client |
| PyJWT | JWT tokens |

---

##  Cấu trúc thư mục

```
src/
├── api/                    # API endpoints
│   ├── controllers/        # Request handlers
│   └── schemas/            # Data validation
├── domain/                 # Business logic
│   ├── models/             # Domain models
│   └── exceptions.py       # Custom exceptions
├── infrastructure/         # External systems
│   ├── databases/          # Database config
│   ├── models/             # DB models
│   └── repositories/       # Data access
├── services/               # Business services
├── app.py                  # Entry point
├── config.py               # Configuration
└── requirements.txt        # Dependencies
```

---

##  Lấy Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn project
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. Thêm **Authorized redirect URI**: `http://localhost:9999/api/auth/google/callback`
7. Copy **Client ID** và **Client Secret** vào file `.env`

---

##  Troubleshooting

### Lỗi "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### Lỗi "GOOGLE_CLIENT_ID not configured"
Kiểm tra file `.env` đã có `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` chưa.
