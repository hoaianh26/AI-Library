# Stage 1: Build Stage
# Sử dụng phiên bản Node.js 18 (Alpine) để build
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json của backend
COPY backend/package*.json ./

# Cài đặt các dependencies cho production
RUN npm ci --only=production

# Sao chép thư mục shared
COPY shared/ shared/

# Sao chép toàn bộ mã nguồn còn lại của backend
COPY backend/ .

# Stage 2: Production Stage
# Sử dụng một image Node.js Alpine nhỏ hơn cho production
FROM node:18-alpine

WORKDIR /usr/src/app

# Sao chép các dependencies đã được cài đặt từ stage 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Sao chép thư mục shared từ stage 'builder'
COPY --from=builder /usr/src/app/shared ./shared

# Sao chép mã nguồn ứng dụng từ stage 'builder'
COPY --from=builder /usr/src/app .

# Mở cổng 5000 để bên ngoài có thể truy cập
EXPOSE 5000

# Lệnh để khởi động ứng dụng
CMD [ "node", "server.js" ]
