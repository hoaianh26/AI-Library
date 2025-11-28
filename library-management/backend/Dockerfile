# Sử dụng phiên bản Node.js 18
FROM node:18-alpine

# Thiết lập thư mục làm việc gốc cho dự án trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json của backend vào trước
# để tận dụng cơ chế caching của Docker, giúp build nhanh hơn khi dependencies không đổi
COPY backend/package*.json backend/

# Di chuyển vào thư mục backend để cài đặt dependencies
WORKDIR /usr/src/app/backend

# Cài đặt chỉ các dependencies cần cho production
RUN npm ci --only=production

# Quay trở lại thư mục gốc của dự án
WORKDIR /usr/src/app

# Sao chép toàn bộ mã nguồn của backend và shared vào container
# Giữ nguyên cấu trúc thư mục gốc
COPY backend/ ./backend/
COPY shared/ ./shared/

# Di chuyển vào thư mục backend để chạy ứng dụng
WORKDIR /usr/src/app/backend

# Mở cổng 5000 để Render có thể truy cập ứng dụng của bạn
EXPOSE 5000

# Lệnh để khởi động ứng dụng
CMD ["node", "server.js"]
