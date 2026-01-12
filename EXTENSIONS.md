# Hướng dẫn cài đặt các Extension (Tiện ích mở rộng) cho dự án

Dưới đây là danh sách các Extension được khuyến nghị để phát triển dự án này trên Visual Studio Code (VS Code).

## 1. Python (Quan trọng)
*   **Tên**: Python
*   **ID**: `ms-python.python`
*   **Mô tả**: Extension chính thức của Microsoft dành cho Python. Cung cấp các tính năng như IntelliSense (gợi ý mã), linting (kiểm tra lỗi), debugging (gỡ lỗi), và quản lý môi trường ảo (venv).
*   **Link**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

## 2. Pylance (Quan trọng)
*   **Tên**: Pylance
*   **ID**: `ms-python.vscode-pylance`
*   **Mô tả**: Hoạt động cùng với extension Python để cung cấp khả năng phân tích mã nhanh và hiệu quả hơn.
*   **Link**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)

## 3. Docker (Khuyên dùng)
*   **Tên**: Docker
*   **ID**: `ms-azuretools.vscode-docker`
*   **Mô tả**: Hỗ trợ quản lý Docker Containers, Images, và Dockerfiles trực tiếp từ editor. Cần thiết nếu bạn chạy SQL Server qua Docker như trong hướng dẫn.
*   **Link**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)

## 4. SQL Server (mssql)
*   **Tên**: SQL Server (mssql)
*   **ID**: `ms-mssql.mssql`
*   **Mô tả**: Cho phép kết nối đến Microsoft SQL Server, viết query SQL và xem kết quả ngay trong VS Code. Rất hữu ích để kiểm tra dữ liệu trong database `FlaskApiDB`.
*   **Link**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql)

## 5. REST Client (Tùy chọn)
*   **Tên**: REST Client
*   **ID**: `humao.rest-client`
*   **Mô tả**: Cho phép gửi HTTP request và xem response trực tiếp trong VS Code. Tiện lợi đẻ test API mà không cần mở Postman.
*   **Link**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

---

## Cách cài đặt

1.  Mở VS Code.
2.  Bấm tổ hợp phím `Ctrl + Shift + X` để mở thanh **Extensions**.
3.  Nhập **ID** hoặc **Tên** của extension vào ô tìm kiếm.
4.  Bấm **Install**.

*Ngoài ra, nếu bạn mở thư mục này bằng VS Code, bạn sẽ thấy thông báo đề xuất cài đặt các extension này (do đã được cấu hình trong file `.vscode/extensions.json`).*
