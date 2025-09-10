#!/bin/bash

# CRM Spa Dr. Oha - Development Environment Setup Script
# This script helps set up the development environment

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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port $1 is already in use"
        return 1
    else
        print_success "Port $1 is available"
        return 0
    fi
}

# Prerequisites check
check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing_deps=()

    # Check Docker
    if command_exists docker; then
        print_success "Docker is installed"
        # Check if Docker is running
        if ! docker info >/dev/null 2>&1; then
            print_error "Docker is not running. Please start Docker first."
            exit 1
        fi
        print_success "Docker is running"
    else
        missing_deps+=("Docker")
    fi

    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        missing_deps+=("Docker Compose")
    fi

    # Check Java
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ]; then
            print_success "Java $JAVA_VERSION is installed"
        else
            print_warning "Java version is $JAVA_VERSION. Recommended: Java 21+"
        fi
    else
        missing_deps+=("Java 21+")
    fi

    # Check Maven
    if command_exists mvn; then
        print_success "Maven is installed"
    else
        missing_deps+=("Maven")
    fi

    # Check Git
    if command_exists git; then
        print_success "Git is installed"
    else
        missing_deps+=("Git")
    fi

    # Check curl
    if command_exists curl; then
        print_success "curl is installed"
    else
        missing_deps+=("curl")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Please install the missing dependencies and run this script again."
        exit 1
    fi

    print_success "All prerequisites are met!"
}

# Function to check if external containers are running
check_external_containers() {
    # Check PostgreSQL container (97cbc867ca58)
    if ! docker ps --filter "id=97cbc867ca58" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}" | grep -q "97cbc867ca58"; then
        print_warning "PostgreSQL container (97cbc867ca58) is not running!"
        print_info "Please ensure PostgreSQL container is running on port 5432"
        return 1
    else
        print_success "PostgreSQL container (97cbc867ca58) is running"
    fi

    # Check Redis container (6b5a88614450)
    if ! docker ps --filter "id=6b5a88614450" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}" | grep -q "6b5a88614450"; then
        print_warning "Redis container (6b5a88614450) is not running!"
        print_info "Please ensure Redis container is running on port 6379"
        return 1
    else
        print_success "Redis container (6b5a88614450) is running"
    fi

    return 0
}

# Check available ports
check_ports() {
    print_header "Checking Required Ports"

    # Chỉ check ports cho app, pgadmin, redis-commander
    # PostgreSQL và Redis đã chạy trên external containers
    local ports=(8081 5050 8082)
    local port_conflicts=()

    for port in "${ports[@]}"; do
        if ! check_port "$port"; then
            port_conflicts+=("$port")
        fi
    done

    if [ ${#port_conflicts[@]} -ne 0 ]; then
        print_warning "Some ports are already in use: ${port_conflicts[*]}"
        print_info "Please free up these ports or modify docker-compose.yml to use different ports."
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "All required ports are available!"
    fi

    # Check external containers
    print_info "Checking external containers..."
    check_external_containers
}

# Setup environment file
setup_environment() {
    print_header "Setting up Environment Configuration"

    if [ ! -f ".env" ]; then
        if [ -f "env-example.txt" ]; then
            cp env-example.txt .env
            print_success "Created .env file from template"
            print_warning "Please review and update the configuration in .env file"
        else
            print_warning "env-example.txt not found. Please create .env manually"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Setup permissions
setup_permissions() {
    print_header "Setting up File Permissions"

    # Make scripts executable
    if [ -f "docker-scripts.sh" ]; then
        chmod +x docker-scripts.sh
        print_success "Made docker-scripts.sh executable"
    fi

    if [ -f "setup.sh" ]; then
        chmod +x setup.sh
        print_success "Made setup.sh executable"
    fi
}

# Build and start services
start_services() {
    print_header "Building and Starting Services"

    print_info "Building Docker images..."
    if ./docker-scripts.sh build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi

    print_info "Starting services..."
    if ./docker-scripts.sh start; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"

    print_info "Waiting for services to be ready..."
    sleep 30

    # Check application health
    if curl -f http://localhost:8081/actuator/health >/dev/null 2>&1; then
        print_success "Application is healthy!"
    else
        print_warning "Application health check failed. It might still be starting up."
    fi

    # Check database connection
    if docker-compose exec -T postgres pg_isready -U postgres -d crm_spa >/dev/null 2>&1; then
        print_success "Database is ready!"
    else
        print_warning "Database health check failed"
    fi

    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        print_success "Redis is ready!"
    else
        print_warning "Redis health check failed"
    fi
}

# Show access information
show_access_info() {
    print_header "Access Information"

    echo "🎉 CRM Spa Dr. Oha is now running!"
    echo ""
    echo "📱 Application URLs:"
    echo "   • Main Application:    http://localhost:8081"
    echo "   • API Documentation:   http://localhost:8081/swagger-ui.html"
    echo "   • Health Check:        http://localhost:8081/actuator/health"
    echo ""
    echo "🗄️  Database Management:"
    echo "   • PgAdmin:             http://localhost:5050"
    echo "   • Username:            admin@crm-spa.com"
    echo "   • Password:            admin123"
    echo ""
    echo "🔄 Redis Management:"
    echo "   • Redis Commander:     http://localhost:8082"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   • View logs:           ./docker-scripts.sh logs"
    echo "   • Check status:        ./docker-scripts.sh status"
    echo "   • Stop services:       ./docker-scripts.sh stop"
    echo "   • Open app shell:      ./docker-scripts.sh shell"
    echo "   • Connect to DB:       ./docker-scripts.sh database"
    echo ""
    echo "📚 For more information, see DOCKER_README.md"
}

# Main setup function
main() {
    print_header "CRM Spa Dr. Oha - Development Setup"

    case "${1:-all}" in
        check)
            check_prerequisites
            check_ports
            ;;
        env)
            setup_environment
            ;;
        permissions)
            setup_permissions
            ;;
        start)
            start_services
            verify_deployment
            show_access_info
            ;;
        all)
            check_prerequisites
            check_ports
            setup_environment
            setup_permissions
            start_services
            verify_deployment
            show_access_info
            ;;
        *)
            echo "Usage: $0 [check|env|permissions|start|all]"
            echo ""
            echo "Commands:"
            echo "  check       - Check prerequisites and ports"
            echo "  env         - Setup environment file"
            echo "  permissions - Setup file permissions"
            echo "  start       - Build and start services"
            echo "  all         - Run full setup (default)"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
