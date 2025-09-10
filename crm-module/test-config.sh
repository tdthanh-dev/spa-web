#!/bin/bash

# Test Configuration Script for CRM Spa Dr. Oha
# This script tests if the application can connect to external databases

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

echo "🧪 Testing CRM Spa Configuration"
echo "================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Test PostgreSQL connection
print_info "Testing PostgreSQL connection..."
if docker exec 97cbc867ca58 psql -U postgres -h localhost -p 5432 -d crm_spa -c "SELECT version();" >/dev/null 2>&1; then
    print_success "PostgreSQL connection successful"

    # Get PostgreSQL version
    PG_VERSION=$(docker exec 97cbc867ca58 psql -U postgres -d crm_spa -c "SELECT version();" | grep -o "PostgreSQL [0-9.]*" | head -1)
    print_info "PostgreSQL version: $PG_VERSION"

    # Check if crm_spa database exists
    if docker exec 97cbc867ca58 psql -U postgres -l | grep -q crm_spa; then
        print_success "Database 'crm_spa' exists"
    else
        print_warning "Database 'crm_spa' does not exist yet - will be created by application"
    fi
else
    print_error "PostgreSQL connection failed"
    print_info "Check if PostgreSQL container is running and accessible"
    exit 1
fi

echo ""

# Test Redis connection
print_info "Testing Redis connection..."
if docker exec 6b5a88614450 redis-cli -h localhost -p 6379 ping | grep -q PONG; then
    print_success "Redis connection successful"

    # Get Redis info
    REDIS_INFO=$(docker exec 6b5a88614450 redis-cli info server | grep -E "redis_version|tcp_port" | head -2)
    print_info "Redis info: $REDIS_INFO"

    # Test Redis database 0
    if docker exec 6b5a88614450 redis-cli -n 0 ping | grep -q PONG; then
        print_success "Redis database 0 accessible"
    else
        print_warning "Redis database 0 not accessible"
    fi
else
    print_error "Redis connection failed"
    print_info "Check if Redis container is running and accessible"
    exit 1
fi

echo ""

# Test network connectivity
print_info "Testing network connectivity..."
if docker run --rm --network host alpine wget -qO- http://localhost:5432 >/dev/null 2>&1; then
    print_success "Network connectivity to PostgreSQL port OK"
else
    print_warning "Network connectivity test inconclusive (expected for PostgreSQL)"
fi

if docker run --rm --network host alpine sh -c "echo 'PING' | nc localhost 6379" >/dev/null 2>&1; then
    print_success "Network connectivity to Redis port OK"
else
    print_warning "Network connectivity to Redis port failed"
fi

echo ""

# Configuration verification
print_info "Configuration Verification:"
echo "Database URL: jdbc:postgresql://localhost:5432/crm_spa"
echo "Database User: postgres"
echo "Database Password: 1234"
echo "Redis Host: localhost"
echo "Redis Port: 6379"
echo "Redis Database: 0"

echo ""

print_success "✅ Configuration test completed!"
echo ""
print_info "If all tests passed, your Docker configuration is correct."
echo "You can now run: ./docker-scripts.sh start"
echo ""
print_info "Application will be available at:"
echo "  - Main App: http://localhost:8081"
echo "  - API Docs: http://localhost:8081/swagger-ui.html"
echo "  - Health:   http://localhost:8081/actuator/health"
