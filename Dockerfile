# Stage 1: Build the UI
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
# Cài đặt các công cụ cần thiết cho server (bao gồm tsx nếu dùng trực tiếp)
COPY package*.json ./
RUN npm install

COPY . .
# Copy kết quả build UI vào thư mục dist
COPY --from=builder /app/dist ./dist

# Port mặc định của project
EXPOSE 8787

# Chạy server API (phục vụ cả static files)
CMD ["npm", "run", "dev:api"]
