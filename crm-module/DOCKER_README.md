# Docker Deployment Guide - CRM Spa Dr. Oha

Hướng dẫn triển khai ứng dụng CRM Spa Dr. Oha bằng Docker và Docker Compose.

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ít nhất 4GB RAM
- Ít nhất 10GB dung lượng ổ cứng

## 🚀 Cài đặt và Chạy Nhanh

### 1. Clone repository và chuyển vào thư mục

```bash
cd crm-module/
```

### 2. Đảm bảo external containers đang chạy

**Quan trọng:** Hệ thống sử dụng external containers:

- **PostgreSQL**: Container ID `97cbc867ca58` (port 5432)
- **Redis**: Container ID `6b5a88614450` (port 6379)

```bash
# Kiểm tra containers đang chạy
docker ps

# Đảm bảo PostgreSQL và Redis containers đang chạy
docker ps --filter "id=97cbc867ca58"  # PostgreSQL
docker ps --filter "id=6b5a88614450"  # Redis
```

### 3. Chạy hệ thống CRM (app + management tools)

```bash
# Cách 1: Sử dụng script (khuyên dùng)
chmod +x docker-scripts.sh
./docker-scripts.sh start

# Cách 2: Sử dụng docker-compose trực tiếp
docker-compose up -d
```

### 4. Kiểm tra trạng thái

```bash
# Kiểm tra trạng thái containers
./docker-scripts.sh status

# Xem logs
./docker-scripts.sh logs
```

### 5. Truy cập ứng dụng

- **CRM Application**: http://localhost:8081
- **API Documentation**: http://localhost:8081/swagger-ui.html
- **PgAdmin**: http://localhost:5050 (admin@crm-spa.com / admin123)
- **Redis Commander**: http://localhost:8082

## 🏗️ Kiến trúc Container

```
crm-network (Docker Compose)
├── crm-app (Spring Boot) :8081
├── crm-pgadmin (PgAdmin) :5050
└── crm-redis-commander (Redis Commander) :8082

External Containers (Standalone)
├── postgres (97cbc867ca58) :5432
└── redis-crm (6b5a88614450) :6379
```

## 📝 Lệnh Docker Thường Dùng

### Quản lý Containers

```bash
# Khởi động tất cả services
./docker-scripts.sh start

# Dừng tất cả services
./docker-scripts.sh stop

# Khởi động lại
./docker-scripts.sh restart

# Xây dựng lại image
./docker-scripts.sh build

# Kiểm tra trạng thái
./docker-scripts.sh status
```

### Debug và Logs

```bash
# Xem logs tất cả services
./docker-scripts.sh logs

# Xem logs của app
./docker-scripts.sh logs app

# Xem logs của database
./docker-scripts.sh logs postgres

# Mở shell trong container app
./docker-scripts.sh shell

# Mở shell trong container postgres
./docker-scripts.sh shell postgres
```

### Database Operations

```bash
# Kết nối PostgreSQL
./docker-scripts.sh database

# Kết nối Redis
./docker-scripts.sh redis

# Trong PostgreSQL shell:
# \dt core.*          # List tables in core schema
# \dt lead.*          # List tables in lead schema
# SELECT * FROM core.customers LIMIT 5;
```

## 🔧 Cấu hình Chi tiết

### Environment Variables

Các biến môi trường quan trọng trong `docker-compose.yml`:

```yaml
environment:
  # Database (External Container)
  SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/crm_spa
  SPRING_DATASOURCE_USERNAME: postgres
  SPRING_DATASOURCE_PASSWORD: 1234

  # Redis (External Container)
  SPRING_DATA_REDIS_HOST: localhost
  SPRING_DATA_REDIS_PORT: 6379
  SPRING_DATA_REDIS_DATABASE: 0
  SPRING_DATA_REDIS_TIMEOUT: 2000ms
  SPRING_DATA_REDIS_LETTUCE_POOL_MAX_ACTIVE: 8
  SPRING_DATA_REDIS_LETTUCE_POOL_MAX_IDLE: 8
  SPRING_DATA_REDIS_LETTUCE_POOL_MIN_IDLE: 0
  SPRING_DATA_REDIS_LETTUCE_POOL_MAX_WAIT: -1ms

  # JWT
  JWT_SECRET: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  JWT_EXPIRATION: 86400000
  JWT_REFRESH_EXPIRATION: 604800000

  # Email
  SPRING_MAIL_HOST: smtp.gmail.com
  SPRING_MAIL_PORT: 587
  SPRING_MAIL_USERNAME: tdthanh.dev2025@gmail.com
  SPRING_MAIL_PASSWORD: uwod xbag oxyd kwnf

  # Application
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8081
```

### Profiles

- `docker`: Profile cho production với Docker
- `dev`: Profile cho development (nếu cần)

### Volumes

- `postgres_data`: Persistent storage cho PostgreSQL
- `redis_data`: Persistent storage cho Redis
- `pgadmin_data`: Storage cho PgAdmin settings

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. Port đã được sử dụng

```bash
# Kiểm tra port nào đang sử dụng
lsof -i :8081
lsof -i :5432
lsof -i :6379

# Thay đổi port trong docker-compose.yml nếu cần
```

#### 2. Container không khởi động được

```bash
# Xem logs chi tiết
./docker-scripts.sh logs app

# Kiểm tra health check
curl http://localhost:8081/actuator/health
```

#### 3. Database connection failed

```bash
# Kiểm tra PostgreSQL container
docker-compose ps postgres

# Kết nối vào database để debug
./docker-scripts.sh database
```

#### 4. Out of memory

```bash
# Tăng memory limit cho Docker Desktop
# Hoặc giảm Java heap size trong Dockerfile
ENV JAVA_OPTS="-Xmx512m"
```

### Logs và Debug

#### Application Logs

```bash
# Xem real-time logs
docker-compose logs -f app

# Xem logs với timestamp
docker-compose logs --timestamps app
```

#### Database Logs

```bash
# PostgreSQL logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis
```

## 🔒 Bảo mật

### Thay đổi mật khẩu mặc định

```yaml
# Trong docker-compose.yml
environment:
  POSTGRES_PASSWORD: your_secure_password
  PGADMIN_DEFAULT_PASSWORD: your_admin_password
  JWT_SECRET_KEY: your_256_bit_secret_key
```

### Sử dụng HTTPS

```yaml
# Thêm vào docker-compose.yml
services:
  app:
    ports:
      - "8443:8443"
    environment:
      SERVER_PORT: 8443
      SERVER_SSL_KEY_STORE: classpath:keystore.p12
      SERVER_SSL_KEY_STORE_PASSWORD: your_password
```

## 📊 Giám sát và Metrics

### Health Checks

```bash
# Kiểm tra health của tất cả services
curl http://localhost:8081/actuator/health

# Application metrics
curl http://localhost:8081/actuator/metrics

# Database health
curl http://localhost:8081/actuator/health/db
```

### Monitoring Tools

- **Spring Boot Actuator**: http://localhost:8081/actuator
- **PgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8082

## 🚀 Triển khai Production

### 1. Tối ưu Dockerfile

```dockerfile
# Sử dụng JRE thay vì JDK
FROM openjdk:21-jre-slim

# Multi-stage build để giảm image size
# Chỉ copy JAR file, không copy source code
```

### 2. Cấu hình Production

```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
  LOGGING_LEVEL_ROOT: WARN
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

### 3. Backup Strategy

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres crm_spa > backup.sql

# Backup volumes
docker run --rm -v crm_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra logs: `./docker-scripts.sh logs`
2. Restart services: `./docker-scripts.sh restart`
3. Clean và rebuild: `./docker-scripts.sh clean && ./docker-scripts.sh build`

## 🎯 Quick Start Checklist

- [ ] Docker và Docker Compose đã cài đặt
- [ ] **External containers đang chạy:**
  - [ ] PostgreSQL container `97cbc867ca58` (port 5432)
  - [ ] Redis container `6b5a88614450` (port 6379)
- [ ] **Test configuration:**
  - [ ] Chạy `./test-config.sh` để verify database/redis connection
- [ ] Port 8081, 5050, 8082 không bị chiếm
- [ ] Chạy `./docker-scripts.sh start`
- [ ] Kiểm tra http://localhost:8081/actuator/health
- [ ] Test API với Swagger UI
- [ ] Kết nối database qua PgAdmin (http://localhost:5050)

---

**🎉 Chúc mừng! Ứng dụng CRM Spa Dr. Oha đã sẵn sàng với Docker!**
