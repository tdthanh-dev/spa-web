#!/bin/bash

# Check External Containers for CRM Spa Dr. Oha
# This script verifies that external PostgreSQL and Redis containers are running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔍 Checking External Containers for CRM Spa Dr. Oha"
echo "=================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check PostgreSQL container (97cbc867ca58)
print_info "Checking PostgreSQL container (97cbc867ca58)..."
if docker ps --filter "id=97cbc867ca58" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "97cbc867ca58"; then
    POSTGRES_INFO=$(docker ps --filter "id=97cbc867ca58" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}")
    print_success "PostgreSQL container is running: $POSTGRES_INFO"

    # Test connection to crm_spa database
    if docker exec 97cbc867ca58 pg_isready -U postgres -d crm_spa >/dev/null 2>&1; then
        print_success "PostgreSQL database 'crm_spa' is accessible"

        # Test actual database connection
        if docker exec 97cbc867ca58 psql -U postgres -d crm_spa -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "PostgreSQL database connection test passed"
        else
            print_warning "PostgreSQL database connection test failed"
        fi
    else
        print_warning "Cannot connect to PostgreSQL database 'crm_spa'"
        print_info "Database might not exist yet. Application will create it on first run."
    fi
else
    print_error "PostgreSQL container (97cbc867ca58) is not running!"
    print_info "Please start the PostgreSQL container first."
    exit 1
fi

echo ""

# Check Redis container (6b5a88614450)
print_info "Checking Redis container (6b5a88614450)..."
if docker ps --filter "id=6b5a88614450" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "6b5a88614450"; then
    REDIS_INFO=$(docker ps --filter "id=6b5a88614450" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}")
    print_success "Redis container is running: $REDIS_INFO"

    # Test connection
    if docker exec 6b5a88614450 redis-cli ping | grep -q PONG; then
        print_success "Redis is responding to ping"

        # Test database 0
        if docker exec 6b5a88614450 redis-cli -n 0 ping | grep -q PONG; then
            print_success "Redis database 0 is accessible"
        else
            print_warning "Redis database 0 connection failed"
        fi
    else
        print_warning "Redis is not responding to ping"
    fi
else
    print_error "Redis container (6b5a88614450) is not running!"
    print_info "Please start the Redis container first."
    exit 1
fi

echo ""
print_success "✅ All external containers are running correctly!"
echo ""
print_info "You can now start the CRM application:"
echo "  cd crm-module/"
echo "  ./docker-scripts.sh start"
echo ""
print_info "Access points after starting:"
echo "  - Application: http://localhost:8081"
echo "  - API Docs:    http://localhost:8081/swagger-ui.html"
echo "  - PgAdmin:     http://localhost:5050"
echo "  - Redis Cmdr:  http://localhost:8082"
