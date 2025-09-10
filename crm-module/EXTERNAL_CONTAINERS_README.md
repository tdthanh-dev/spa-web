# External Containers Configuration

## 📋 Thông tin Containers Hiện tại

Hệ thống CRM Spa Dr. Oha sử dụng **external containers** thay vì tạo mới:

### PostgreSQL Database

- **Container ID**: `97cbc867ca58`
- **Image**: `postgres:16`
- **Port**: `5432:5432`
- **Status**: Running (2 hours ago, 0% CPU)

### Redis Cache

- **Container ID**: `6b5a88614450`
- **Image**: `redis:latest`
- **Port**: `6379:6379`
- **Status**: Running (2 hours ago, 0.29% CPU)

## 🔧 Cấu hình Kết nối

### Application Configuration

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/crm_spa
spring.datasource.username=postgres
spring.datasource.password=1234

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### Docker Compose Services

Docker compose sẽ tạo:

- **crm-app**: Spring Boot application (port 8081)
- **crm-pgadmin**: Database management (port 5050)
- **crm-redis-commander**: Redis management (port 8082)

## 🚀 Khởi động Hệ thống

```bash
# 1. Kiểm tra external containers
docker ps --filter "id=97cbc867ca58"  # PostgreSQL
docker ps --filter "id=6b5a88614450"  # Redis

# 2. Khởi động hệ thống CRM
cd crm-module/
./docker-scripts.sh start

# 3. Kiểm tra trạng thái
./docker-scripts.sh status
```

## 📱 Truy cập

- **Application**: http://localhost:8081
- **API Docs**: http://localhost:8081/swagger-ui.html
- **PgAdmin**: http://localhost:5050 (admin@crm-spa.com/admin123)
- **Redis Commander**: http://localhost:8082

## ⚠️ Lưu ý Quan trọng

1. **Đừng stop external containers** - chúng đang được sử dụng
2. **Kiểm tra port conflicts** - đảm bảo port 5432, 6379 không bị chiếm
3. **Backup data** - external containers có thể có dữ liệu quan trọng

## 🔍 Troubleshooting

```bash
# Kiểm tra containers
docker ps

# Xem logs external containers
docker logs 97cbc867ca58  # PostgreSQL
docker logs 6b5a88614450  # Redis

# Kiểm tra network connectivity
docker network ls
```

## 📞 Hỗ trợ

Nếu external containers bị stop:

```bash
# Restart PostgreSQL
docker start 97cbc867ca58

# Restart Redis
docker start 6b5a88614450
```
